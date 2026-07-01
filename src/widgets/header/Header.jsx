import {
   Avatar,
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
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logoutApi } from '../../shared/api/auth.api';
import { Notifications } from '../customer-notifications/ui/Notifications';
import { getCompactEmail } from '../../shared/helpers/helpers';
import { PROFILE_PHOTO_UPDATED_EVENT } from '../customer-profile/model/profile-photo.helpers';
import { fetchCustomerProfile } from '../../features/profile-edit/profile.api';

export function Header() {
   const [isBurgerOpen, setIsBurgerOpen] = useState(false);
   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
   const [profileAnchorEl, setProfileAnchorEl] = useState(null);
   const [isLogoutLoading, setIsLogoutLoading] = useState(false);
   const [logoutError, setLogoutError] = useState(null);

   const location = useLocation();
   const navigate = useNavigate();

   const isProfileMenuOpen = Boolean(profileAnchorEl);
   const isLeadsPage = location.pathname === '/customer';
   const isTenderPage = location.pathname === '/customer/tenders';
   const isFactoringsPage = location.pathname === '/customer/factorings';
   const isForwardersPage = location.pathname === '/customer/forwarders';
   const userEmail = window?.APP_DATA?.user_email || 'Пользователь';
   const userEmailLabel = getCompactEmail(userEmail);
   const [profilePhoto, setProfilePhoto] = useState('');

   function handleNavigate(path) {
      if (location.pathname === path) {
         handleCloseBurger();
         return;
      }

      navigate(path);
      handleCloseBurger();
   }

   function handleNavigateProfile() {
      handleCloseProfileMenu();
      handleNavigate('/customer/profile');
   }

   function handleOpenProfileMenu(event) {
      const anchorElement = event.currentTarget;

      anchorElement.blur();
      setProfileAnchorEl(anchorElement);
   }

   function handleCloseProfileMenu() {
      blurActiveElement();
      setProfileAnchorEl(null);
   }

   function handleOpenBurger(event) {
      event.currentTarget.blur();

      requestAnimationFrame(() => {
         setIsBurgerOpen(true);
      });
   }

   function handleOpenLogoutModal() {
      handleCloseProfileMenu();
      setLogoutError(null);

      requestAnimationFrame(() => {
         setIsLogoutModalOpen(true);
      });
   }

   function blurActiveElement() {
      if (document.activeElement instanceof HTMLElement) {
         document.activeElement.blur();
      }
   }

   function handleCloseLogoutModal() {
      if (isLogoutLoading) {
         return;
      }

      blurActiveElement();
      setLogoutError(null);
      setIsLogoutModalOpen(false);
   }

   function handleCloseBurger() {
      blurActiveElement();
      setIsBurgerOpen(false);
   }

   async function handleConfirmLogout() {
      try {
         setIsLogoutLoading(true);
         setLogoutError(null);

         await logoutApi();

         window.location.href = '/auth';
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

   useEffect(() => {
      let isCancelled = false;

      async function loadProfileAvatar() {
         try {
            const profile = await fetchCustomerProfile();

            if (!isCancelled) {
               setProfilePhoto(profile?.avatar || '');
            }
         } catch {
            if (!isCancelled) {
               setProfilePhoto('');
            }
         }
      }

      function handleProfilePhotoUpdated(event) {
         setProfilePhoto(event.detail?.photoUrl || '');
      }

      loadProfileAvatar();

      window.addEventListener(
         PROFILE_PHOTO_UPDATED_EVENT,
         handleProfilePhotoUpdated,
      );

      return () => {
         isCancelled = true;

         window.removeEventListener(
            PROFILE_PHOTO_UPDATED_EVENT,
            handleProfilePhotoUpdated,
         );
      };
   }, []);

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
               <IconButton onClick={handleOpenBurger}>
                  <MenuIcon />
               </IconButton>

               <Typography fontWeight={500}>Header</Typography>

               <Box
                  sx={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: 1,
                     minWidth: 0,
                     flexShrink: 1,
                     ml: 'auto',
                  }}
               >
                  <Notifications />

                  <Button
                     variant='outlined'
                     onClick={handleOpenProfileMenu}
                     title={userEmail}
                     aria-label={`Профиль пользователя ${userEmail}`}
                     sx={{
                        minWidth: 0,
                        maxWidth: {
                           xs: 140,
                           sm: 220,
                           md: 280,
                        },
                        px: {
                           xs: 0.75,
                           sm: 1.25,
                        },
                        textTransform: 'none',
                        overflow: 'hidden',
                        flexShrink: 1,
                        gap: 0.75,
                     }}
                  >
                     <Avatar
                        src={profilePhoto || undefined}
                        sx={{
                           width: {
                              xs: 24,
                              sm: 28,
                           },
                           height: {
                              xs: 24,
                              sm: 28,
                           },
                           fontSize: 13,
                           flexShrink: 0,
                        }}
                     />

                     <Typography
                        component='span'
                        noWrap
                        sx={{
                           display: 'block',
                           minWidth: 0,
                           maxWidth: '100%',
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           whiteSpace: 'nowrap',
                           fontSize: {
                              xs: 12,
                              sm: 14,
                           },
                           lineHeight: 1.4,
                        }}
                     >
                        {userEmailLabel}
                     </Typography>
                  </Button>
               </Box>
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
                     selected={isLeadsPage}
                     onClick={() => {
                        if (isLeadsPage) {
                           handleCloseBurger();
                           return;
                        }

                        handleNavigate('/customer');
                     }}
                  >
                     <ListItemText
                        primary='Leads'
                        primaryTypographyProps={{
                           sx: {
                              color: isLeadsPage
                                 ? 'primary.main'
                                 : 'text.primary',
                              fontWeight: isLeadsPage ? 600 : 400,
                           },
                        }}
                     />
                  </ListItemButton>
                  <ListItemButton
                     selected={isTenderPage}
                     onClick={() => {
                        if (isTenderPage) {
                           handleCloseBurger();
                           return;
                        }

                        handleNavigate('/customer/tenders');
                     }}
                  >
                     <ListItemText
                        primary='Tenders'
                        primaryTypographyProps={{
                           sx: {
                              color: isTenderPage
                                 ? 'primary.main'
                                 : 'text.primary',
                              fontWeight: isTenderPage ? 600 : 400,
                           },
                        }}
                     />
                  </ListItemButton>
                  <ListItemButton
                     selected={isFactoringsPage}
                     onClick={() => {
                        if (isFactoringsPage) {
                           handleCloseBurger();
                           return;
                        }

                        handleNavigate('/customer/factorings');
                     }}
                  >
                     <ListItemText
                        primary='Factorings'
                        primaryTypographyProps={{
                           sx: {
                              color: isFactoringsPage
                                 ? 'primary.main'
                                 : 'text.primary',
                              fontWeight: isFactoringsPage ? 600 : 400,
                           },
                        }}
                     />
                  </ListItemButton>
                  <ListItemButton
                     selected={isForwardersPage}
                     onClick={() => {
                        if (isForwardersPage) {
                           handleCloseBurger();
                           return;
                        }

                        handleNavigate('/customer/forwarders');
                     }}
                  >
                     <ListItemText
                        primary='Forwarders'
                        primaryTypographyProps={{
                           sx: {
                              color: isForwardersPage
                                 ? 'primary.main'
                                 : 'text.primary',
                              fontWeight: isForwardersPage ? 600 : 400,
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
            onClose={handleCloseProfileMenu}
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
