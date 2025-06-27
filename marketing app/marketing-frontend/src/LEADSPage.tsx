import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, CardMedia, Box, TextField, Tabs, Tab
} from '@mui/material';

function LEADSPage() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    axios.get('http://localhost:3000/leads')
      .then(response => setLeads(response.data))
      .catch(error => console.error('Error fetching leads:', error));
  }, []);

  // Filter leads by search and category
  const filteredLeads = leads.filter((lead: any) =>
    (category === 'all' || lead.category === category) &&
    (lead.name.toLowerCase().includes(search.toLowerCase()) ||
     lead.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ backgroundColor: '#171a21', minHeight: '100vh', color: '#fff' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#171a21' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MARKETING SHOP
          </Typography>
          <Button color="inherit">Store</Button>
          <Button color="inherit">Community</Button>
          <Button color="inherit">About</Button>
          <Button color="inherit">Support</Button>
        </Toolbar>
      </AppBar>

      {/* Banner */}
      <Box
        sx={{
          background: 'linear-gradient(90deg, #1b2838 60%, #66c0f4 100%)',
          p: 4,
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="https://store.cloudflare.steamstatic.com/public/shared/images/header/globalheader_logo.png"
          alt="Banner"
          style={{ height: 80, marginRight: 32 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Welcome to the Marketing Shop!
        </Typography>
      </Box>

      {/* Search Bar and Categories */}
      <Container sx={{ mb: 4 }}>
        <TextField
          label="Search leads"
          variant="outlined"
          fullWidth
          sx={{ mb: 2, backgroundColor: '#fff', borderRadius: 1 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Tabs
          value={category}
          onChange={(_, val) => setCategory(val)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ mb: 2 }}
        >
          <Tab value="all" label="All" />
          <Tab value="category1" label="Category 1" />
          <Tab value="category2" label="Category 2" />
          {/* Add more categories as needed */}
        </Tabs>
      </Container>

      {/* Product/Lead Grid */}
      <Container>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Featured Leads
        </Typography>
        <Grid container spacing={3}>
          {filteredLeads.map((lead: any) => (
            <Grid item xs={12} sm={6} md={4} key={lead.id}>
              <Card
                sx={{ backgroundColor: '#23262e', color: '#fff', cursor: 'pointer' }}
                onClick={() => window.location.href = `/leads/${lead.id}`}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={lead.image || 'https://via.placeholder.com/300x140?text=Lead+Image'}
                  alt={lead.name}
                />
                <CardContent>
                  <Typography variant="h6">{lead.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lead.email}
                  </Typography>
                  {/* Add more fields as needed */}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default LEADSPage; 