import * as React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';

import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpIcon from '@mui/icons-material/Help';

import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import { UserAuth } from './auth/AuthContext';
import ProfileService from '../services/profileService';

export default function NavigationDrawer() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [open, setOpen] = useState(false);
  const { session } = UserAuth();
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    ProfileService.getProfileByAuthUserId(session.user.id)
      .then((res) => setRole((res.data || res)?.role))
      .catch(() => setRole(null));
  }, [session]);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleProfileClick = () => {
    navigate('/patient-profile');
  };

  const IconList = [
    { id: 1, text: 'Settings', Icon: SettingsIcon, href: '/settings' },
    { id: 2, text: 'Help', Icon: HelpIcon, href: '/help' },
    { id: 3, text: 'Logout', Icon: LogoutIcon, href: '/' },
  ];

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {IconList.map((item) => (
          <React.Fragment key={item.id}>
          <ListItem key={item.id} disablePadding >
            <ListItemButton >
              <Box component={Link} to={item.href} 
                  sx={{textDecoration: 'none',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                <ListItemIcon>
                  <item.Icon />
                </ListItemIcon>
                
                <ListItemText primary={item.text} />
              </Box>
              
            </ListItemButton>
            
          </ListItem>
          <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  const patientLinks = [
    { id: 'p-dashboard', text: 'Dashboard', href: '/patient' },
    { id: 'p-weekly', text: 'Weekly Report', href: '/patient/weekly-report' },
    { id: 'p-history', text: 'History', href: '/patient/history' },
    { id: 'p-appts', text: 'Appointments', href: '/patient/appointments' },
  ];

  const providerLinks = [
    { id: 'd-dashboard', text: 'Dashboard', href: '/doctor' },
    { id: 'd-appts', text: 'Appointments', href: '/doctor/appointments' },
    { id: 'd-avail', text: 'Availability', href: '/doctor/availability' },
    { id: 'd-patients', text: 'Patients', href: '/doctor/patients' },
  ];

  const NavigationPageList =
    role === 'provider' ? providerLinks : role === 'patient' ? patientLinks : [];

  const navActiveStyle = () => ({
    fontWeight: 'bold',
    color: 'blue',
    padding: '2em',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center'
  });
  const navInactiveStyle = () => ({
    color: 'black',
    padding: '2em',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center'
  });

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              onClick={toggleDrawer(true)}
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Box direction={"row"} sx={{ display: 'flex', textAlign: 'center', flex: 1 }}>
              {NavigationPageList.map((item) => (
                <NavLink key={item.id} to={item.href} style={currentPath === item.href ? navActiveStyle : navInactiveStyle}>
                  <ListItemText primary={item.text} />
                </NavLink>
              ))}
            </Box>

            <IconButton
              onClick={handleProfileClick}
              size="large"
              edge="end"
              sx={{ ml: 'auto' }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#863bff',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}
              >
                {(role === 'provider' ? 'D' : 'P')}
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
