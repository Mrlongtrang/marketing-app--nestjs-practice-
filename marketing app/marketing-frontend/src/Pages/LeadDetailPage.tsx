import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Card, CardContent, CardMedia, Box } from '@mui/material';

function LeadDetailPage() {
  const { id } = useParams();
  const [lead, setLead] = useState<any>(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/leads/${id}`)
      .then(response => setLead(response.data))
      .catch(error => console.error('Error fetching lead:', error));
  }, [id]);

  if (!lead) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ backgroundColor: '#171a21', minHeight: '100vh', color: '#fff', py: 4 }}>
      <Container>
        <Card sx={{ backgroundColor: '#23262e', color: '#fff', maxWidth: 600, mx: 'auto' }}>
          <CardMedia
            component="img"
            height="240"
            image={lead.image || 'https://via.placeholder.com/600x240?text=Lead+Image'}
            alt={lead.name}
          />
          <CardContent>
            <Typography variant="h4">{lead.name}</Typography>
            <Typography variant="body1">{lead.email}</Typography>
            {/* Add more fields/details as needed */}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default LeadDetailPage; 