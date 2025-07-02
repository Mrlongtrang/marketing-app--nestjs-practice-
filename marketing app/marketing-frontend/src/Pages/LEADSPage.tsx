import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LogoutButton from './LogoutButton';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
} from  '@mui/material';

const LEADSPage: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axiosInstance.get('/leads');
        setLeads(response.data);
      } catch (error) {
        console.error('Failed to fetch leads', error);
      }
    };

    fetchLeads();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLeadClick = (id: number) => {
    navigate(`/leads/${id}`);
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Leads
        </Typography>
        <Box my={4} display="flex" justifyContent="space-between" alignItems="center">
         <Typography variant="h4" gutterBottom>
          Leads
         </Typography>

          <LogoutButton />
          </Box>

        <TextField
          label="Search leads"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
        />
         <Button variant="outlined" color="error" onClick={() => {
          localStorage.removeItem('access_token');
           localStorage.removeItem('refresh_token');
            navigate('/login');
             }}>
            Logout
         </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredLeads.map((lead: any) => (
          <Grid item xs={12} sm={6} md={4} key={lead.id}>
            <Box  
              p={2}
              border="1px solid #ccc"
              borderRadius={4}
              onClick={() => handleLeadClick(lead.id)}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
            >
              <Typography variant="h6">{lead.name}</Typography>
              <Typography>{lead.email}</Typography>
              <Typography>{lead.phone}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default LEADSPage;
