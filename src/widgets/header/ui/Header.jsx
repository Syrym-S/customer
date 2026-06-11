import {
   Box,
   Button,
   Container,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Drawer,
   IconButton,
   List,
   ListItemButton,
   ListItemText,
   Menu,
   MenuItem,
   Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logoutApi } from '../../../shared/api/auth.api';

export function Header() {
   const [isBurgerOpen, setIsBurgerOpen] = useState(false);
   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
   const [profileAnchorEl, setProfileAnchorEl] = useState(null);
   const [isLogoutLoading, setIsLogoutLoading] = useState(false);
   const [logoutError, setLogoutError] = useState(null);

   const location = useLocation();
   const navigate = useNavigate();

   const isProfileMenuOpen = Boolean(profileAnchorEl);
   const isCustomerPage = location.pathname === '/customer';
   const userEmail = window?.APP_DATA?.user_email || 'Пользователь';

   function handleNavigate(path) {
      if (location.pathname === path) return;

      navigate(path);
      setIsBurgerOpen(false);
   }

   function handleNavigateProfile() {
      setProfileAnchorEl(null);
      handleNavigate('/customer/profile');
   }

   function handleOpenLogoutModal() {
      setProfileAnchorEl(null);
      setLogoutError(null);
      setIsLogoutModalOpen(true);
   }

   async function handleConfirmLogout() {
      try {
         setIsLogoutLoading(true);
         setLogoutError(null);

         await logoutApi();

         window.location.href = '/login';
      } catch (error) {
         setLogoutError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось выйти из аккаунта',
         );
      } finally {
         setIsLogoutLoading(false);
      }
   }

   function handleCloseLogoutModal() {
      if (isLogoutLoading) {
         return;
      }

      setLogoutError(null);
      setIsLogoutModalOpen(false);
   }

   function handleCloseBurger() {
      setIsBurgerOpen(false);
   }

   return (
      <Box
         component='header'
         sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
         }}
      >
         <Container maxWidth='xl'>
            <Box
               sx={{
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
               }}
            >
               <IconButton onClick={() => setIsBurgerOpen(true)}>
                  <MenuIcon />
               </IconButton>

               <Typography fontWeight={500}>Header</Typography>

               <Button
                  variant='outlined'
                  onClick={(event) => setProfileAnchorEl(event.currentTarget)}
                  sx={{
                     maxWidth: {
                        xs: 160,
                        sm: 240,
                     },
                     textTransform: 'none',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     whiteSpace: 'nowrap',
                  }}
                  title={userEmail}
               >
                  {userEmail}
               </Button>
            </Box>
         </Container>

         <Drawer
            open={isBurgerOpen}
            onClose={handleCloseBurger}
            slotProps={{
               paper: {
                  sx: {
                     width: {
                        xs: '100%',
                        sm: 280,
                     },
                  },
               },
            }}
         >
            <Box sx={{ p: 2 }}>
               <Box
                  sx={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     mb: 2,
                  }}
               >
                  <Typography fontWeight={600}>Menu</Typography>

                  <IconButton
                     onClick={handleCloseBurger}
                     aria-label='Закрыть меню'
                  >
                     <CloseIcon />
                  </IconButton>
               </Box>

               <List>
                  <ListItemButton
                     selected={isCustomerPage}
                     onClick={() => {
                        if (isCustomerPage) {
                           handleCloseBurger();
                           return;
                        }

                        handleNavigate('/customer');
                     }}
                  >
                     <ListItemText
                        primary='Customer'
                        primaryTypographyProps={{
                           sx: {
                              color: isCustomerPage
                                 ? 'primary.main'
                                 : 'text.primary',
                              fontWeight: isCustomerPage ? 600 : 400,
                           },
                        }}
                     />
                  </ListItemButton>
               </List>
            </Box>
         </Drawer>

         <Menu
            anchorEl={profileAnchorEl}
            open={isProfileMenuOpen}
            onClose={() => setProfileAnchorEl(null)}
         >
            <MenuItem onClick={handleNavigateProfile}>Профиль</MenuItem>

            <MenuItem>Настройки</MenuItem>

            <MenuItem onClick={handleOpenLogoutModal}>Выход</MenuItem>
         </Menu>

         <Dialog open={isLogoutModalOpen} onClose={handleCloseLogoutModal}>
            <DialogTitle>Выход из аккаунта</DialogTitle>

            <DialogContent>
               <DialogContentText>
                  Вы уверены, что хотите выйти?
               </DialogContentText>

               {logoutError && (
                  <DialogContentText color='error' sx={{ mt: 2 }}>
                     {logoutError}
                  </DialogContentText>
               )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button
                  onClick={handleCloseLogoutModal}
                  disabled={isLogoutLoading}
               >
                  Отмена
               </Button>

               <Button
                  color='error'
                  variant='contained'
                  onClick={handleConfirmLogout}
                  disabled={isLogoutLoading}
               >
                  {isLogoutLoading ? 'Выход...' : 'Выйти'}
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
}
