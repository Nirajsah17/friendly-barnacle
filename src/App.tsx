import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography, Button, TextField } from '@mui/material';
import { MessageCircle, UserPlus } from 'lucide-react';
import io from 'socket.io-client';
import Peer from 'peerjs';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

const socket = io('http://localhost:3001');
const peer = new Peer();

function App() {
  const [connected, setConnected] = useState(false);
  const [peerId, setPeerId] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    peer.on('open', (id) => {
      setPeerId(id);
      socket.emit('newUser', id);
    });

    peer.on('connection', (conn) => {
      setConnected(true);
      conn.on('data', (data) => {
        setMessages((prevMessages) => [...prevMessages, `Partner: ${data}`]);
      });
      conn.on('close', () => {
        setConnected(false);
        setMessages([]);
      });
    });

    socket.on('match', (partnerId) => {
      const conn = peer.connect(partnerId);
      conn.on('open', () => {
        setConnected(true);
        conn.on('data', (data) => {
          setMessages((prevMessages) => [...prevMessages, `Partner: ${data}`]);
        });
      });
    });

    return () => {
      socket.off('match');
      peer.destroy();
    };
  }, []);

  const handleConnect = () => {
    socket.emit('findPartner', peerId);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && connected) {
      peer.connections[Object.keys(peer.connections)[0]][0].send(inputMessage);
      setMessages((prevMessages) => [...prevMessages, `You: ${inputMessage}`]);
      setInputMessage('');
    }
  };

  const handleDisconnect = () => {
    Object.values(peer.connections).forEach((conns) => {
      conns.forEach((conn) => conn.close());
    });
    setConnected(false);
    setMessages([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Random Chat App
          </Typography>
          {!connected ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<UserPlus />}
              onClick={handleConnect}
              fullWidth
            >
              Connect to Random User
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDisconnect}
              fullWidth
            >
              Disconnect
            </Button>
          )}
          <Box sx={{ mt: 2, height: '300px', overflowY: 'auto' }}>
            {messages.map((message, index) => (
              <Typography key={index}>{message}</Typography>
            ))}
          </Box>
          <Box sx={{ mt: 2, display: 'flex' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={!connected}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<MessageCircle />}
              onClick={handleSendMessage}
              disabled={!connected}
              sx={{ ml: 1 }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;