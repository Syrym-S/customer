import { cloneElement, useEffect, useRef, useState } from 'react';
import {
   Box,
   Button,
   CircularProgress,
   InputAdornment,
   Paper,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   TextField,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

import { TnvedRow } from './TnvedRow';
import { LeadsPagination } from '../../customer-leads/ui/LeadsPagination';
import { fetchTnvedCatalog } from '../api/tnved.repository';
import {
   collectAllNodeKeys,
   getNodeKey,
   mergeTnvedTrees,
} from '../model/tnved-tree.helpers';

const PAGE_SIZE = 100;

function nodeMatchesQuery(node, normalizedQuery) {
   const codeMatches = node.code && node.code.toLowerCase().startsWith(normalizedQuery);
   const nameMatches = node.name.toLowerCase().includes(normalizedQuery);

   return Boolean(codeMatches || nameMatches);
}

function renderNodeRows({ nodes, level, expandedKeys, onToggle, normalizedQuery }) {
   const rows = [];

   nodes.forEach((node) => {
      const nodeKey = getNodeKey(level, node.id);
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const isHighlighted =
         normalizedQuery.length > 0 && nodeMatchesQuery(node, normalizedQuery);

      rows.push(
         <TnvedRow
            key={nodeKey}
            node={node}
            level={level}
            expandedKeys={expandedKeys}
            onToggle={onToggle}
            isHighlighted={isHighlighted}
         />,
      );

      if (hasChildren && expandedKeys.has(nodeKey)) {
         rows.push(
            ...renderNodeRows({
               nodes: node.children,
               level: level + 1,
               expandedKeys,
               onToggle,
               normalizedQuery,
            }),
         );
      }
   });

   return rows;
}

export function TnvedTable() {
   const [searchInput, setSearchInput] = useState('');
   const [appliedQuery, setAppliedQuery] = useState('');
   const [page, setPage] = useState(1);
   const [results, setResults] = useState([]);
   const [count, setCount] = useState(0);
   const [expandedKeys, setExpandedKeys] = useState(new Set());
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      const timeoutId = window.setTimeout(() => {
         setAppliedQuery(searchInput.trim());
         setPage(1);
      }, 300);

      return () => {
         window.clearTimeout(timeoutId);
      };
   }, [searchInput]);

   const previousQueryRef = useRef(appliedQuery);

   useEffect(() => {
      let isCancelled = false;

      async function loadCatalog() {
         try {
            setIsLoading(true);

            const response = await fetchTnvedCatalog({
               q: appliedQuery || undefined,
               page,
               perPage: PAGE_SIZE,
            });

            if (isCancelled) {
               return;
            }

            const isNewQuery = previousQueryRef.current !== appliedQuery;
            previousQueryRef.current = appliedQuery;

            // The API paginates leaf-level codes, not sections: every page
            // repeats the same ancestor chain down to a different slice of
            // codes. So a new page of the same query must be merged into
            // the already-loaded tree (by id, at every level) — replacing
            // it would drop codes fetched on earlier pages. A changed
            // search query starts a fresh tree instead.
            //
            // The tree stays fully expanded by default (not just while
            // searching) — otherwise paging through merges new codes deep
            // inside already-collapsed nodes, and the next page looks
            // identical to the previous one.
            setResults((previousResults) => {
               const mergedResults = isNewQuery
                  ? response.results
                  : mergeTnvedTrees(previousResults, response.results);

               setExpandedKeys(new Set(collectAllNodeKeys(mergedResults)));

               return mergedResults;
            });
            setCount(response.count);
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }

      loadCatalog();

      return () => {
         isCancelled = true;
      };
   }, [appliedQuery, page]);

   function handleToggle(nodeKey) {
      setExpandedKeys((previous) => {
         const next = new Set(previous);

         if (next.has(nodeKey)) {
            next.delete(nodeKey);
         } else {
            next.add(nodeKey);
         }

         return next;
      });
   }

   function handleReset() {
      setSearchInput('');
   }

   const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
   const normalizedQuery = appliedQuery.trim().toLowerCase();

   const rows = renderNodeRows({
      nodes: results,
      level: 0,
      expandedKeys,
      onToggle: handleToggle,
      normalizedQuery,
   }).map((row, index) => cloneElement(row, { isOdd: index % 2 === 1 }));

   return (
      <Box sx={{ display: 'grid', gap: 2 }}>
         <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TextField
               value={searchInput}
               onChange={(event) => setSearchInput(event.target.value)}
               placeholder="Поиск по коду или наименованию"
               size="small"
               sx={{ flex: 1, minWidth: 260 }}
               InputProps={{
                  startAdornment: (
                     <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                     </InputAdornment>
                  ),
               }}
            />

            <Button
               variant="outlined"
               startIcon={<ClearRoundedIcon />}
               onClick={handleReset}
               disabled={!searchInput}
            >
               Очистить
            </Button>
         </Box>

         <Paper sx={{ overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: '65vh' }}>
               <Table stickyHeader size="small">
                  <TableHead>
                     <TableRow>
                        <TableCell sx={{ width: 140 }}>Код</TableCell>
                        <TableCell>Наименование</TableCell>
                     </TableRow>
                  </TableHead>

                  <TableBody>
                     {isLoading ? (
                        <TableRow>
                           <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                              <CircularProgress size={24} />
                           </TableCell>
                        </TableRow>
                     ) : rows.length ? (
                        rows
                     ) : (
                        <TableRow>
                           <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                              Ничего не найдено
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            </TableContainer>
         </Paper>

         <LeadsPagination
            page={page}
            count={pageCount}
            onChange={(_, nextPage) => setPage(nextPage)}
         />
      </Box>
   );
}
