import { useEffect, useState } from 'react';
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
import { fetchTnvedCatalog } from '../api/tnved.repository';
import { collectAllNodeKeys, getNodeKey } from '../model/tnved-tree.helpers';

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

            // TODO: confirm with backend whether cross-branch ancestor dedup
            // happens server-side; currently we render whatever shape the
            // response gives us.
            setResults(response.results);
            setExpandedKeys(
               appliedQuery
                  ? new Set(collectAllNodeKeys(response.results))
                  : new Set(),
            );
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

   const normalizedQuery = appliedQuery.trim().toLowerCase();

   const rows = renderNodeRows({
      nodes: results,
      level: 0,
      expandedKeys,
      onToggle: handleToggle,
      normalizedQuery,
   });

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

         {/* Pagination hidden: /customer/v1/tnved currently ignores the
             `page` param for this listing and returns the same results on
             every page, while `count` reflects the full nested catalog
             size rather than the number of root items — showing a page
             control here would be misleading until the backend is fixed. */}
      </Box>
   );
}
