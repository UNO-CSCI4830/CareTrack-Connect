import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Stack from '@mui/material/Stack';

import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpIcon from '@mui/icons-material/Help';

import {Link, NavLink, useLocation} from 'react-router-dom'


import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export default function NavigationDrawer() {
  const location = useLocation();
  const currentPath = location.pathname
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const IconList = [
    {id:1, text: 'Settings', Icon: SettingsIcon, href: '/settings'},
    {id:2, text: 'Help', Icon: HelpIcon, href: '/help'},
    {id:3, text: 'Logout', Icon: LogoutIcon, href: '/'}]

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {IconList.map((item) => (
          <>
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
          </>
        ))}
      </List>
    </Box>
    
  );

  const NavigationPageList = [
    {id:1, text: 'Dashboard', href: '/patient'},
    {id:2, text: 'Weekly Report', href: '/weekly-report'},
    {id:3, text: 'History', href: '/history'}
  ]

  //Styles for active/inactive links
  const navActiveStyle = () => ({
    fontWeight: 'bold',
    color: 'blue',
    padding: '2em',
    textDecoration: 'none',
    display: 'flex', 
    alignItems: 'center'
  })
  //inactive
  const navInactiveStyle = () => ({
    color: 'black',
    padding: '2em',
    textDecoration: 'none',
    display: 'flex', 
    alignItems: 'center'
  
                  
  })

  return (
    <div>
        <Box sx={{ flexGrow: 1}}>
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

            <Box direction={"row"} sx={{ display: 'flex', textAlign: 'center' }}>

              {NavigationPageList.map((item) => (
                //Figure this out
                <NavLink key={item.id} to={item.href} style={currentPath === item.href ? navActiveStyle: navInactiveStyle}>
                  <ListItemText  primary={item.text}/>
                </NavLink>
              ))

              }

            </Box>
            </Toolbar>
        </AppBar>
        </Box>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}