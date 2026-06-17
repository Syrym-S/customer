import {
   Badge,
   Box,
   Button,
   Container,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Divider,
   Drawer,
   IconButton,
   List,
   ListItemButton,
   ListItemText,
   Menu,
   MenuItem,
   Typography,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logoutApi } from '../../shared/api/auth.api';

const mockNotifications = [
   {
      id: 1,
      title: 'Создан новый тендер',
      description: 'Тендер по маршруту Алматы → Астана успешно создан',
      time: '2 мин назад',
      isUnread: true,
   },
   {
      id: 2,
      title: 'Новая ставка',
      description: 'Экспедитор оставил ставку по активному тендеру',
      time: '15 мин назад',
      isUnread: true,
   },
   {
      id: 3,
      title: 'Статус лида обновлён',
      description: 'Водитель начал движение по маршруту',
      time: '1 час назад',
      isUnread: false,
   },
];

export function Header() {
   const [isBurgerOpen, setIsBurgerOpen] = useState(false);
   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
   const [profileAnchorEl, setProfileAnchorEl] = useState(null);
   const [isLogoutLoading, setIsLogoutLoading] = useState(false);
   const [logoutError, setLogoutError] = useState(null);
   const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

   const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);

   const unreadNotificationsCount = mockNotifications.filter(
      (notification) => notification.isUnread,
   ).length;

   const location = useLocation();
   const navigate = useNavigate();

   const isProfileMenuOpen = Boolean(profileAnchorEl);
   const isCustomerPage = location.pathname === '/customer';
   const isTenderPage = location.pathname === '/customer/tenders';
   const userEmail = window?.APP_DATA?.user_email || 'Пользователь';

   function handleOpenNotifications(event) {
      setNotificationsAnchorEl(event.currentTarget);
   }

   function handleCloseNotifications() {
      setNotificationsAnchorEl(null);
   }

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

               <Box
                  sx={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: 1,
                     minWidth: 0,
                  }}
               >
                  <IconButton
                     color='inherit'
                     onClick={handleOpenNotifications}
                     aria-label='Уведомления'
                  >
                     <Badge
                        badgeContent={unreadNotificationsCount}
                        color='error'
                        invisible={unreadNotificationsCount === 0}
                     >
                        <NotificationsNoneOutlinedIcon />
                     </Badge>
                  </IconButton>

                  <Button
                     variant='outlined'
                     onClick={(event) =>
                        setProfileAnchorEl(event.currentTarget)
                     }
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
               </List>
            </Box>
         </Drawer>

         <Menu
            anchorEl={notificationsAnchorEl}
            open={isNotificationsMenuOpen}
            onClose={handleCloseNotifications}
            slotProps={{
               paper: {
                  sx: {
                     width: 360,
                     maxWidth: 'calc(100vw - 32px)',
                     mt: 1,
                     borderRadius: 3,
                  },
               },
            }}
         >
            <Box sx={{ px: 2, py: 1.5 }}>
               <Typography fontWeight={700}>Уведомления</Typography>

               <Typography variant='body2' color='text.secondary'>
                  Последние события по вашим заявкам и тендерам
               </Typography>
            </Box>

            <Divider />

            {mockNotifications.length === 0 ? (
               <MenuItem disabled>
                  <ListItemText
                     primary='Уведомлений пока нет'
                     secondary='Здесь будут отображаться новые события'
                  />
               </MenuItem>
            ) : (
               mockNotifications.map((notification) => (
                  <MenuItem
                     key={notification.id}
                     onClick={handleCloseNotifications}
                     sx={{
                        alignItems: 'flex-start',
                        gap: 1,
                        py: 1.25,
                        whiteSpace: 'normal',
                        backgroundColor: notification.isUnread
                           ? 'rgba(25, 118, 210, 0.06)'
                           : 'transparent',
                     }}
                  >
                     <Box
                        sx={{
                           width: 8,
                           height: 8,
                           mt: 0.75,
                           borderRadius: '50%',
                           backgroundColor: notification.isUnread
                              ? 'primary.main'
                              : 'transparent',
                           flexShrink: 0,
                        }}
                     />

                     <ListItemText
                        primary={
                           <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                              {notification.title}
                           </Typography>
                        }
                        secondary={
                           <Box>
                              <Typography
                                 component='span'
                                 color='text.secondary'
                                 sx={{
                                    display: 'block',
                                    fontSize: 13,
                                    lineHeight: 1.35,
                                 }}
                              >
                                 {notification.description}
                              </Typography>

                              <Typography
                                 component='span'
                                 color='text.disabled'
                                 sx={{
                                    display: 'block',
                                    mt: 0.5,
                                    fontSize: 12,
                                 }}
                              >
                                 {notification.time}
                              </Typography>
                           </Box>
                        }
                     />
                  </MenuItem>
               ))
            )}

            <Divider />

            <MenuItem onClick={handleCloseNotifications}>
               <Typography
                  color='primary.main'
                  fontWeight={600}
                  sx={{
                     width: '100%',
                     textAlign: 'center',
                  }}
               >
                  Смотреть все уведомления
               </Typography>
            </MenuItem>
         </Menu>

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
