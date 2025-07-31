import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Box,
  Typography,
  Link,
  TableSortLabel,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Close as CloseIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import axiosService from '../services/axiosService';

const customerData = [
  {
    id: 1,
    customerName: 'customer 2',
    address: '123 abc street',
    website: 'https://www.google.com/',
    description: 'lorem ipsum'
  },
  {
    id: 2,
    customerName: 'customer 2',
    address: 'new 1232 abc',
    website: 'https://www.google.com/',
    description: 'abdss'
  },
  {
    id: 3,
    customerName: 'customer4',
    address: 'customer4 street',
    website: 'https://www.google.com/',
    description: 'sample 855'
  },
  {
    id: 4,
    customerName: 'customer5',
    address: 'customer5 street 455 floor room no 714',
    website: 'https://www.google.com/',
    description: 'sample852'
  },
  {
    id: 5,
    customerName: 'customer6',
    address: 'customer6street',
    website: 'https://www.google.com/',
    description: 'sample 522'
  },
  {
    id: 6,
    customerName: 'customer7',
    address: 'customer7street',
    website: 'https://www.google.com/',
    description: 'sample7584'
  },
  {
    id: 7,
    customerName: 'customer8',
    address: 'customer8 street',
    website: 'https://www.google.com/',
    description: 'sample454'
  }
];

export default function CustomerTable() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState('list');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
      showToast(`Switched to ${newViewMode === 'list' ? 'list' : 'grid'} view`, 'info');
    }
  };

  const handleEdit = (customerId) => {
    console.log('Edit customer:', customerId);
    showToast('Edit functionality coming soon!', 'info');
  };

  const handleDelete = (customerId) => {
    const customerToDelete = customers.find(customer => customer.id === customerId);
    setCustomers(customers.filter(customer => customer.id !== customerId));
    showToast(`${customerToDelete?.customerName || 'User'} deleted successfully`, 'success');
  };

  const handleAddCustomer = () => {
    showToast('Opening Add User form...', 'info');
    navigate('/dashboard/add-user');
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosService.get('/user/list-users');
        console.log('API Response:', response.data);
        
        // Check if response has the expected structure
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Transform the API data to match our component structure
          const transformedData = response.data.data.map((user, index) => ({
            id: user.id || index + 1,
            customerName: user.authName || user.authUserName || `User ${index + 1}`,
            address: user.address || 'No address provided',
            website: user.authUserName ? `mailto:${user.authUserName}` : 'https://www.example.com/',
            description: `Status: ${user.authStatus || 'Unknown'}, Timezone: ${user.timeZone || 'Unknown'}`
          }));
          
          setCustomers(transformedData);
          showToast(`Successfully loaded ${transformedData.length} users`, 'success');
        } else {
          console.error('Unexpected API response structure:', response.data);
          setError('Invalid data format received from server.');
          showToast('Invalid data format received from server', 'error');
          setCustomers(customerData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again.');
        showToast('Failed to load users. Using sample data instead.', 'warning');
        // Fallback to mock data if API fails
        setCustomers(customerData);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [showToast]);

  return (
         <Box sx={{ 
       width: '100%', 
       p: 6,
       borderRadius: '12px',
       boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
       elevation: 6,
       background: '#fff',
       border: '1px solid #f0f0f0'
     }}>
        {/* Header with Add Customer button and View Toggle */}
              <Box sx={{ 
           display: 'flex', 
           justifyContent: 'space-between', 
           alignItems: 'center', 
           mb: 3 
         }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                border: '1px solid #e0e0e0',
                color: '#666',
                '&.Mui-selected': {
                  bgcolor: '#f5f5f5',
                  color: '#333',
                },
              },
            }}
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>

                     <Button
             variant="contained"
             onClick={handleAddCustomer}
             sx={{
               bgcolor: '#000000',
               '&:hover': {
                 bgcolor: '#5e35b1',
               },
               borderRadius: '8px',
               textTransform: 'none',
               fontWeight: 600,
               px: 3,
               py: 1.5,
               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
             }}
           >
            Add User
          </Button>
        </Box>

                          {/* Loading State */}
                          {loading ? (
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              py: 8 
                            }}>
                              <CircularProgress size={40} />
                              <Typography sx={{ ml: 2, color: '#666' }}>
                                Loading users...
                              </Typography>
                            </Box>
                          ) : (
                            /* Content based on view mode */
                            viewMode === 'list' ? (
           /* Table View */
                                               <TableContainer 
               component={Paper} 
               sx={{ 
                 boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                 borderRadius: '12px',
                 overflow: 'hidden',
                 elevation: 4,
                 background: '#fff',
                 border: 'none',
                 p: 0
               }}
             >
             <Table sx={{ minWidth: 650 }}>
               <TableHead>
                 <TableRow sx={{ 
                   background: 'linear-gradient(160deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                 }}>
              <TableCell 
                        sx={{ 
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '16px',
                          py: 3,
                          px: 3,
                          borderBottom: 'none'
                        }}
                      >
                      <TableSortLabel
                        sx={{
                          color: 'white !important',
                          '& .MuiTableSortLabel-icon': {
                            color: 'white !important',
                          },
                        }}
                      >
                        UserName
                      </TableSortLabel>
                    </TableCell>
                     <TableCell 
                       sx={{ 
                         color: 'white',
                         fontWeight: 600,
                         fontSize: '16px',
                         py: 3,
                         px: 3,
                         borderBottom: 'none'
                       }}
                     >
                       Address
                     </TableCell>
                     <TableCell 
                       sx={{ 
                         color: 'white',
                         fontWeight: 600,
                         fontSize: '16px',
                         py: 3,
                         px: 3,
                         borderBottom: 'none'
                       }}
                     >
                       Website
                     </TableCell>
                     <TableCell 
                       sx={{ 
                         color: 'white',
                         fontWeight: 600,
                         fontSize: '16px',
                         py: 3,
                         px: 3,
                         borderBottom: 'none'
                       }}
                     >
                       Description
                     </TableCell>
                     <TableCell 
                       sx={{ 
                         color: 'white',
                         fontWeight: 600,
                         fontSize: '16px',
                         py: 3,
                         px: 3,
                         borderBottom: 'none'
                       }}
                     >
                       Actions
                     </TableCell>
                  </TableRow>
                </TableHead>
               <TableBody>
                 {customers.map((customer, index) => (
                                    <TableRow 
                      key={customer.id}
                                                                                           sx={{ 
                          bgcolor: index % 2 === 0 ? '#ffffff' : '#f5f5f5',
                          '&:hover': {
                            bgcolor: '#f8f9fa',
                          },
                        }}
                    >
                                        <TableCell 
                        sx={{ 
                          fontSize: '16px', 
                          color: '#333',
                          fontWeight: 400,
                          py: 2.5,
                          px: 3
                        }}
                      >
                       {customer.customerName}
                     </TableCell>
                                        <TableCell 
                        sx={{ 
                          fontSize: '16px', 
                          color: '#666',
                          py: 2.5,
                          px: 3
                        }}
                      >
                        {customer.address}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          py: 2.5,
                          px: 3
                        }}
                      >
                       <Link 
                         href={customer.website}
                         target="_blank"
                         rel="noopener noreferrer"
                         sx={{
                           color: '#1976d2',
                           textDecoration: 'none',
                           fontSize: '16px',
                           '&:hover': {
                             textDecoration: 'underline',
                           }
                         }}
                       >
                         {customer.website}
                       </Link>
                     </TableCell>
                                        <TableCell 
                        sx={{ 
                          fontSize: '16px', 
                          color: '#666',
                          py: 2.5,
                          px: 3
                        }}
                      >
                        {customer.description}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          py: 2.5,
                          px: 3
                        }}
                      >
                       <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                            onClick={() => handleEdit(customer.id)}
                            size="small"
                            sx={{
                              color: '#5e35b1',
                              '&:hover': {
                                bgcolor: '#ede7f6',
                              },
                            }}
                          >
                           <EditIcon fontSize="small" />
                         </IconButton>
                         <IconButton
                           onClick={() => handleDelete(customer.id)}
                           size="small"
                           sx={{
                             color: '#dc2626',
                             '&:hover': {
                               bgcolor: '#ffeaea',
                             },
                           }}
                         >
                           <CloseIcon fontSize="small" />
                         </IconButton>
                       </Box>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
                    </TableContainer>
         ) : (
                       /* Grid View */
            <Grid container spacing={3}>
              {customers.map((customer) => (
                <Grid item xs={12} sm={6} md={4} key={customer.id}>
                  <Card 
                    sx={{ 
                      height: 280,
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <CardContent sx={{ 
                      p: 3, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <Box>
                        {/* Customer Name with Avatar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: '#e0e0e0', 
                              color: '#666',
                              width: 32,
                              height: 32,
                              mr: 2,
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                          >
                            C
                          </Avatar>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: '#333',
                              fontSize: '16px'
                            }}
                          >
                            {customer.customerName}
                          </Typography>
                        </Box>

                                                 {/* Address */}
                         <Typography 
                           variant="body2" 
                           sx={{ 
                             color: '#666',
                             mb: 1.5,
                             fontSize: '14px',
                             lineHeight: 1.4,
                             overflow: 'hidden',
                             textOverflow: 'ellipsis',
                             display: '-webkit-box',
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: 'vertical'
                           }}
                         >
                           {customer.address}
                         </Typography>

                         {/* Website */}
                         <Link 
                           href={customer.website}
                           target="_blank"
                           rel="noopener noreferrer"
                           sx={{
                             color: '#1976d2',
                             textDecoration: 'none',
                             fontSize: '14px',
                             display: 'block',
                             mb: 1.5,
                             overflow: 'hidden',
                             textOverflow: 'ellipsis',
                             whiteSpace: 'nowrap',
                             '&:hover': {
                               textDecoration: 'underline',
                             }
                           }}
                         >
                           {customer.website}
                         </Link>

                         {/* Description */}
                         <Typography 
                           variant="body2" 
                           sx={{ 
                             color: '#666',
                             fontSize: '14px',
                             lineHeight: 1.4,
                             overflow: 'hidden',
                             textOverflow: 'ellipsis',
                             display: '-webkit-box',
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: 'vertical'
                           }}
                         >
                           {customer.description}
                         </Typography>
                      </Box>

                      {/* Action Icons */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        mt: 'auto',
                        pt: 2
                      }}>
                        <IconButton
                          onClick={() => handleEdit(customer.id)}
                          size="small"
                          sx={{
                            color: '#5e35b1',
                            '&:hover': {
                              bgcolor: '#ede7f6',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(customer.id)}
                          size="small"
                          sx={{
                            color: '#dc2626',
                            '&:hover': {
                              bgcolor: '#ffeaea',
                            },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
         )
       )}
       </Box>
   );
 }