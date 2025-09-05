import { Outlet, Link } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material'
import { useAuth } from './features/auth/AuthContext'
import './App.css'

function App() {
  const { user, logout } = useAuth()
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>LMS</Typography>
          <Button color="inherit" component={Link} to="/">Catalog</Button>
          <Button color="inherit" component={Link} to="/profile">Profile</Button>
          <Button color="inherit" component={Link} to="/admin">Admin</Button>
          {user ? (
            <>
              <Typography sx={{ mx: 1 }} variant="body2">{user.email}</Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/auth">Sign In</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3, flex: 1 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>© {new Date().getFullYear()} LMS</Box>
    </Box>
  )
}

export default App
