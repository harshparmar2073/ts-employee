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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Close as CloseIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Email as EmailIcon,
  PersonAdd as PersonAddIcon,
  Security
} from '@mui/icons-material';
import SendIcon from '@mui/icons-material/Send';
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

export default function UserTable() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState('list');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalUserData, setOriginalUserData] = useState(null);

  // Invite functionality states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    message: ''
  });
  const [inviteErrors, setInviteErrors] = useState({});

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
      showToast(`Switched to ${newViewMode === 'list' ? 'list' : 'grid'} view`, 'info');
    }
  };

  const handleEdit = (customerId) => {
    const userToEdit = customers.find(customer => customer.id === customerId);
    if (userToEdit) {
      // Store the original user data for editing
      setOriginalUserData(userToEdit);
      
      // Create a combined data object with both transformed and original data
      const editData = {
        ...userToEdit,
        // Ensure originalData is available for address parsing
        originalData: userToEdit.originalData || userToEdit
      };
      
      // Navigate to AddUser component with edit mode
      navigate('/dashboard/add-user', { 
        state: { 
          isEditMode: true, 
          userData: editData,
          userId: customerId 
        } 
      });
      
      showToast(`Editing user: ${userToEdit.customerName}`, 'info');
    } else {
      showToast('User not found for editing', 'error');
    }
  };

  const handleDelete = (customerId) => {
    const customerToDelete = customers.find(customer => customer.id === customerId);
    setCustomers(customers.filter(customer => customer.id !== customerId));
    showToast(`${customerToDelete?.customerName || 'User'} deleted successfully`, 'success');
  };

  const handleAddCustomer = () => {
    showToast('Opening Add User form...', 'info');
    navigate('/dashboard/add-user', { 
      state: { 
        isEditMode: false 
      } 
    });
  };

  // Invite functionality
  const handleSendInvite = () => {
    setInviteDialogOpen(true);
    setInviteFormData({
      email: '',
      firstName: '',
      lastName: '',
      message: ''
    });
    setInviteErrors({});
  };

  const validateInviteForm = () => {
    const errors = {};
    
    if (!inviteFormData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(inviteFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!inviteFormData.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!inviteFormData.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    setInviteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInviteSubmit = async () => {
    if (!validateInviteForm()) {
      return;
    }

    setInviteLoading(true);
    
    try {
      // Mock API call - simulate sending invite email
      console.log('Simulating invite email for:', inviteFormData.email);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response
      const mockResponse = {
        success: true,
        message: 'Invite sent successfully',
        email: inviteFormData.email,
        inviteLink: 'https://example.com/accept-invite?token=mock-token'
      };

      console.log('Mock invite sent successfully:', mockResponse);
      showToast(`Invite sent successfully to ${inviteFormData.email} (Mock)`, 'success');
      setInviteDialogOpen(false);
      
      // Optionally refresh the user list to show new invited users
      // fetchUsers();
      
    } catch (error) {
      console.error('Error in mock invite:', error);
      showToast('Failed to send invite. Please try again.', 'error');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleInviteFormChange = (field, value) => {
    setInviteFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (inviteErrors[field]) {
      setInviteErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
    setInviteFormData({
      email: '',
      firstName: '',
      lastName: '',
      message: ''
    });
    setInviteErrors({});
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosService.get('/user/list-users');
        console.log('API Response:', response.data);
        
        // Check if response has the expected structure
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Transform the API data to match our component structure
          const transformedData = response.data.data.map((user, index) => ({
            id: user.id || index + 1,
            customerName: user.authName || user.authUserName || `User ${index + 1}`,
            // Preserve the original address object structure for editing
            address: user.address || 'No address provided',
            website: user.authUserName ? `mailto:${user.authUserName}` : 'https://www.example.com/',
            description: `Status: ${user.authStatus || 'Unknown'}, Timezone: ${user.timeZone || 'Unknown'}`,
            // Store original user data for editing - this contains the full address object
            originalData: user
          }));
          
          setCustomers(transformedData);
          showToast(`Successfully loaded ${transformedData.length} users`, 'success');
        } else {
          console.error('Unexpected API response structure:', response.data);
          showToast('Invalid data format received from server', 'error');
          setCustomers(customerData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
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

          <Box sx={{ display: 'flex', gap: 2 }}>
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

            <Button
              variant="contained"
              startIcon={<SendIcon/>}
              onClick={handleSendInvite}
              sx={{
                // bgcolor: '#10b981',
                // '&:hover': {
                //   bgcolor: '#059669',
                // },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              }}
            >
              Send Invite
            </Button>
          </Box>
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
                        {customer.address ? (
                          typeof customer.address === 'string' 
                            ? customer.address 
                            : `${customer.address.street || ''}, ${customer.address.city || ''}, ${customer.address.state || ''}, ${customer.address.country || ''}`
                        ) : 'No address'}
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
                           {customer.address ? (
                             typeof customer.address === 'string' 
                               ? customer.address 
                               : `${customer.address.street || ''}, ${customer.address.city || ''}, ${customer.address.state || ''}, ${customer.address.country || ''}`
                           ) : 'No address'}
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

       {/* Send Invite Dialog */}
       <Dialog
         open={inviteDialogOpen}
         onClose={handleCloseInviteDialog}
         maxWidth="sm"
         fullWidth
         PaperProps={{
           sx: {
             borderRadius: 4,
             boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
             overflow: 'hidden',
             maxHeight: '90vh',
           }
         }}
       >
         <DialogTitle
           sx={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             color: 'white',
             fontWeight: 700,
             display: 'flex',
             alignItems: 'center',
             gap: 2,
             px: 4,
             py: 2.5,
             fontSize: '1.25rem',
           }}
         >
           <PersonAddIcon sx={{ fontSize: 28 }} />
           Invite New User
         </DialogTitle>
         
         <DialogContent sx={{ px: 4, pt: 3, pb: 2, overflow: 'hidden' }}>
           <Alert 
             severity="info" 
             sx={{ 
               mb: 3,
               mt: 2,
               borderRadius: 2,
               backgroundColor: '#e3f2fd',
               border: '1px solid #2196f3',
               '& .MuiAlert-icon': {
                 color: '#1976d2',
               }
             }}
           >
             <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
               Send a professional invitation email to a new user. They'll receive a secure link to create their account.
             </Typography>
           </Alert>

           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
             {/* Email Field */}
             <TextField
               fullWidth
               label="Email Address"
               value={inviteFormData.email}
               onChange={(e) => handleInviteFormChange('email', e.target.value)}
               error={!!inviteErrors.email}
               helperText={inviteErrors.email}
               InputProps={{
                 startAdornment: (
                   <InputAdornment position="start">
                     <EmailIcon sx={{ color: '#667eea' }} />
                   </InputAdornment>
                 ),
               }}
               placeholder="colleague@company.com"
               sx={{
                 '& .MuiOutlinedInput-root': {
                   borderRadius: 2,
                   '&:hover .MuiOutlinedInput-notchedOutline': {
                     borderColor: '#667eea',
                   },
                   '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: '#667eea',
                   },
                 },
                 '& .MuiInputLabel-root.Mui-focused': {
                   color: '#667eea',
                 },
               }}
             />

             {/* Name Fields */}
             <Box sx={{ display: 'flex', gap: 2.5 }}>
               <TextField
                 fullWidth
                 label="First Name"
                 value={inviteFormData.firstName}
                 onChange={(e) => handleInviteFormChange('firstName', e.target.value)}
                 error={!!inviteErrors.firstName}
                 helperText={inviteErrors.firstName}
                 placeholder="John"
                 sx={{
                   '& .MuiOutlinedInput-root': {
                     borderRadius: 2,
                     '&:hover .MuiOutlinedInput-notchedOutline': {
                       borderColor: '#667eea',
                     },
                     '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                       borderColor: '#667eea',
                     },
                   },
                   '& .MuiInputLabel-root.Mui-focused': {
                     color: '#667eea',
                   },
                 }}
               />
               <TextField
                 fullWidth
                 label="Last Name"
                 value={inviteFormData.lastName}
                 onChange={(e) => handleInviteFormChange('lastName', e.target.value)}
                 error={!!inviteErrors.lastName}
                 helperText={inviteErrors.lastName}
                 placeholder="Doe"
                 sx={{
                   '& .MuiOutlinedInput-root': {
                     borderRadius: 2,
                     '&:hover .MuiOutlinedInput-notchedOutline': {
                       borderColor: '#667eea',
                     },
                     '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                       borderColor: '#667eea',
                     },
                   },
                   '& .MuiInputLabel-root.Mui-focused': {
                     color: '#667eea',
                   },
                 }}
               />
             </Box>

             {/* Custom Message */}
             <TextField
               fullWidth
               label="Personal Message (Optional)"
               value={inviteFormData.message}
               onChange={(e) => handleInviteFormChange('message', e.target.value)}
               multiline
               rows={2}
               placeholder="Hi! I'd like to invite you to join our team. We're excited to have you on board and look forward to working together."
               sx={{
                 '& .MuiOutlinedInput-root': {
                   borderRadius: 2,
                   '&:hover .MuiOutlinedInput-notchedOutline': {
                     borderColor: '#667eea',
                   },
                   '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: '#667eea',
                   },
                 },
                 '& .MuiInputLabel-root.Mui-focused': {
                   color: '#667eea',
                 },
               }}
             />
           </Box>

           {/* Security Note */}
           <Box sx={{ 
             mt: 2, 
             p: 1.5, 
             backgroundColor: '#f8f9fa', 
             borderRadius: 2,
             border: '1px solid #e9ecef'
           }}>
             <Typography variant="caption" sx={{ 
               color: '#6c757d', 
               display: 'flex', 
               alignItems: 'center', 
               gap: 1,
               fontWeight: 500
             }}>
               <Security sx={{ fontSize: 16 }} />
               Secure invitation link will be sent to the user's email
             </Typography>
           </Box>
         </DialogContent>

         <DialogActions sx={{ px: 4, pb: 3, gap: 2 }}>
           <Button
             onClick={handleCloseInviteDialog}
             variant="outlined"
             disabled={inviteLoading}
             sx={{ 
               borderRadius: 2, 
               px: 4,
               py: 1.5,
               fontWeight: 600,
             }}
           >
             Cancel
           </Button>
           <Button
             onClick={handleInviteSubmit}
             variant="contained"
             disabled={inviteLoading}
             startIcon={inviteLoading ? <CircularProgress size={18} /> : <EmailIcon />}
             sx={{
               borderRadius: 2,
               px: 4,
               py: 1.5,
               fontWeight: 600,
               textTransform: 'none',
               fontSize: '0.95rem',
               '&:disabled': {
                 bgcolor: '#ccc',
                 transform: 'none',
                 boxShadow: 'none',
               }
             }}
           >
             {inviteLoading ? 'Sending Invite...' : 'Send Invitation'}
           </Button>
         </DialogActions>
       </Dialog>
     </Box>
   );
 }