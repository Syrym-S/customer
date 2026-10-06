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
import { mergeTnvedTrees } from '../model/tnved-tree.helpers';

const PAGE_SIZE = 100;

function nodeMatchesQuery(node, normalizedQuery) {
   const codeMatches = node.code && node.code.toLowerCase().startsWith(normalizedQuery);
   const nameMatches = node.name.toLowerCase().includes(normalizedQuery);

   return Boolean(codeMatches || nameMatches);
}

function renderNodeRows({ nodes, level, normalizedQuery }) {
   const rows = [];

   nodes.forEach((node) => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const isHighlighted =
         normalizedQuery.length > 0 && nodeMatchesQuery(node, normalizedQuery);

      rows.push(
         <TnvedRow
            key={`${level}:${node.id}`}
            node={node}
            level={level}
            isHighlighted={isHighlighted}
         />,
      );

      if (hasChildren) {
         rows.push(
            ...renderNodeRows({
               nodes: node.children,
               level: level + 1,
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

            setResults((previousResults) =>
               isNewQuery
                  ? response.results
                  : mergeTnvedTrees(previousResults, response.results),
            );
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

   function handleReset() {
      setSearchInput('');
   }

   const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
   const normalizedQuery = appliedQuery.trim().toLowerCase();

   const rows = renderNodeRows({
      nodes: results,
      level: 0,
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
