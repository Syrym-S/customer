import { useEffect, useMemo, useState } from 'react';
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
import { fetchTnvedTree, searchTnved } from '../api/tnved.repository';
import { collectAllNodeKeys, getNodeKey } from '../model/tnved-tree.helpers';

const ROOT_PAGE_SIZE = 100;

function nodeMatchesQuery(node, normalizedQuery) {
   const codeMatches = node.code && node.code.includes(normalizedQuery);
   const nameMatches = node.name.toLowerCase().includes(normalizedQuery);

   return Boolean(codeMatches || nameMatches);
}

function renderNodeRows({
   nodes,
   parentPath,
   level,
   expandedKeys,
   onToggle,
   normalizedQuery,
   startOffset = 0,
}) {
   const rows = [];

   nodes.forEach((node, index) => {
      const effectiveIndex = level === 0 ? startOffset + index : index;
      const path = [...parentPath, effectiveIndex];
      const nodeKey = getNodeKey(path);
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const isHighlighted =
         normalizedQuery.length > 0 && nodeMatchesQuery(node, normalizedQuery);

      rows.push(
         <TnvedRow
            key={nodeKey}
            node={node}
            path={path}
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
               parentPath: path,
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
   const [fullTree, setFullTree] = useState([]);
   const [displayTree, setDisplayTree] = useState([]);
   const [searchInput, setSearchInput] = useState('');
   const [expandedKeys, setExpandedKeys] = useState(new Set());
   const [page, setPage] = useState(1);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      let isCancelled = false;

      async function loadTree() {
         try {
            setIsLoading(true);

            const tree = await fetchTnvedTree();

            if (!isCancelled) {
               setFullTree(tree);
               setDisplayTree(tree);
            }
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }

      loadTree();

      return () => {
         isCancelled = true;
      };
   }, []);

   useEffect(() => {
      const query = searchInput.trim();

      if (!query) {
         setDisplayTree(fullTree);
         setExpandedKeys(new Set());
         setPage(1);
         return undefined;
      }

      let isCancelled = false;

      const timeoutId = window.setTimeout(async () => {
         const result = await searchTnved(query);

         if (!isCancelled) {
            setDisplayTree(result);
            setExpandedKeys(new Set(collectAllNodeKeys(result)));
            setPage(1);
         }
      }, 300);

      return () => {
         isCancelled = true;
         window.clearTimeout(timeoutId);
      };
   }, [searchInput, fullTree]);

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

   const pageCount = Math.max(1, Math.ceil(displayTree.length / ROOT_PAGE_SIZE));
   const pagedRootNodes = useMemo(() => {
      const startIndex = (page - 1) * ROOT_PAGE_SIZE;

      return displayTree.slice(startIndex, startIndex + ROOT_PAGE_SIZE);
   }, [displayTree, page]);

   const rootStartIndex = (page - 1) * ROOT_PAGE_SIZE;
   const normalizedQuery = searchInput.trim().toLowerCase();

   const rows = renderNodeRows({
      nodes: pagedRootNodes,
      parentPath: [],
      level: 0,
      expandedKeys,
      onToggle: handleToggle,
      normalizedQuery,
      startOffset: rootStartIndex,
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

         {pageCount > 1 && (
            <LeadsPagination
               page={page}
               count={pageCount}
               onChange={(_, nextPage) => setPage(nextPage)}
            />
         )}
      </Box>
   );
}
