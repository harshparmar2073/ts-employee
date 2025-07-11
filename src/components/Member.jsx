import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    Paper,
    Tabs,
    Tab,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    Avatar,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    Select,
    MenuItem,
    FormControl,
    Pagination,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
    List as ListIcon, // Keep ListIcon if needed elsewhere, otherwise remove
    CalendarMonth,
    NotificationsNone,
    SettingsOutlined,
    KeyboardArrowDown,
    Search,
    ArrowForward,
    Close as CloseIcon,
    LocalOffer,
    Event,
    Clear,
    ErrorOutline,
    // New icons for Accounts and Users
    AccountBalance, // For Accounts
    Person // For Users
} from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';

// Date Picker Imports
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

// Import axios directly
import axios from 'axios';
import axiosService from '../services/axiosService';


// Mock user data (assuming this comes from context or props in a real app)
const userData = {
    name: 'John Doe',
    initials: 'JD',
    email: 'john.doe@example.com',
};

// Styled components for responsive table cells
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const MobileTableCell = styled(TableCell)(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        display: 'none',
    },
    padding: theme.spacing(1),
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: 'none',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    justifyContent: 'space-between',
    padding: theme.spacing(0, 2),
    minHeight: '64px',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: theme.spacing(1, 1),
        minHeight: 'auto',
    },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    minHeight: '64px',
    '& .MuiTabs-indicator': {
        backgroundColor: theme.palette.primary.main,
        height: '3px',
    },
    '& .MuiTab-root': {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.9rem',
        minHeight: '64px',
        padding: theme.spacing(0, 2),
        color: '#555',
        '&.Mui-selected': {
            color: theme.palette.primary.main,
        },
        '& .MuiTab-iconWrapper': {
            marginRight: theme.spacing(0.5),
        },
    },
}));

const StyledReminderButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    borderColor: '#ccc',
    color: '#555',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '0.85rem',
    '&:hover': {
        borderColor: '#bbb',
        backgroundColor: '#f5f5f5',
    },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    boxShadow: 'none',
}));

const StyledSearchTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '6px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e0e0e0',
        '& fieldset': {
            borderColor: 'transparent',
        },
        '&:hover fieldset': {
            borderColor: 'transparent',
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            borderWidth: '1px',
        },
        height: '32px',
        fontSize: '0.8rem',
    },
    '& .MuiInputAdornment-root': {
        color: '#6c757d',
    },
    '& input': {
        padding: '6px 10px',
        fontSize: '0.8rem',
    },
    minWidth: '140px',
    [theme.breakpoints.down('sm')]: {
        minWidth: 'unset',
        width: '100%',
    },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    borderRadius: '6px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    height: '32px',
    fontSize: '0.75rem',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1px',
    },
    '& .MuiSelect-select': {
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.75rem',
    },
    '& .MuiSelect-icon': {
        fontSize: '1rem',
    },
    minWidth: '90px',
    [theme.breakpoints.down('sm')]: {
        minWidth: 'unset',
        width: '100%',
    },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    height: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '4px',
    '& .MuiChip-deleteIcon': {
        fontSize: '1rem',
        marginRight: '4px',
    },
}));

const CustomDateFilterDialog = ({
    open,
    onClose,
    selectedDateFilterType,
    setSelectedDateFilterType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    onApply,
    onClear
}) => {
    const handlePredefinedDateChange = (event) => {
        const type = event.target.value;
        setSelectedDateFilterType(type);
        const today = new Date();
        let newStartDate = null;
        let newEndDate = null;

        // Reset time component to avoid issues with date comparisons
        today.setHours(0, 0, 0, 0);

        switch (type) {
            case 'Today':
                newStartDate = today;
                newEndDate = today;
                break;
            case 'This Week':
                const firstDayOfWeek = new Date(today);
                firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
                newStartDate = firstDayOfWeek;
                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Saturday
                newEndDate = lastDayOfWeek;
                break;
            case 'Next Week':
                const nextWeekStart = new Date(today);
                nextWeekStart.setDate(today.getDate() - today.getDay() + 7);
                newStartDate = nextWeekStart;
                const nextWeekEnd = new Date(nextWeekStart);
                nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
                newEndDate = nextWeekEnd;
                break;
            case 'This Month':
                newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
                newEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'Next Month':
                newStartDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                newEndDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
                break;
            case 'This Quarter':
                const currentMonth = today.getMonth();
                const currentQuarter = Math.floor(currentMonth / 3);
                newStartDate = new Date(today.getFullYear(), currentQuarter * 3, 1);
                newEndDate = new Date(today.getFullYear(), currentQuarter * 3 + 3, 0);
                break;
            case 'Next Quarter':
                const nextQuarterStartMonth = today.getMonth() + 3 - (today.getMonth() % 3);
                newStartDate = new Date(today.getFullYear(), nextQuarterStartMonth, 1);
                newEndDate = new Date(today.getFullYear(), nextQuarterStartMonth + 3, 0);
                break;
            case 'This Year':
                newStartDate = new Date(today.getFullYear(), 0, 1);
                newEndDate = new Date(today.getFullYear(), 11, 31);
                break;
            case 'Overdue':
                newStartDate = new Date(1900, 0, 1); // Very old date
                newEndDate = today;
                break;
            case 'Custom Range':
                // Do not set dates here, let the DatePickers handle it
                break;
            default:
                newStartDate = null;
                newEndDate = null;
                break;
        }
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Filter by Date</DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, p: 2 }}>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '180px' } }}>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <StyledSelect
                            value={selectedDateFilterType}
                            onChange={handlePredefinedDateChange}
                            displayEmpty
                        >
                            <MenuItem value="Date">Filter by Date</MenuItem> {/* Default option */}
                            <MenuItem value="Today">Today</MenuItem>
                            <MenuItem value="This Week">This Week</MenuItem>
                            <MenuItem value="Next Week">Next Week</MenuItem>
                            <MenuItem value="This Month">This Month</MenuItem>
                            <MenuItem value="Next Month">Next Month</MenuItem>
                            <MenuItem value="This Quarter">This Quarter</MenuItem>
                            <MenuItem value="Next Quarter">Next Quarter</MenuItem>
                            <MenuItem value="This Year">This Year</MenuItem>
                            <MenuItem value="Overdue">Overdue</MenuItem>
                            <MenuItem value="Custom Range">Custom Range</MenuItem>
                        </StyledSelect>
                    </FormControl>
                </Box>
                <Box sx={{ flex: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => {
                                setStartDate(newValue);
                                setSelectedDateFilterType('Custom Range');
                            }}
                            renderInput={(params) => <TextField {...params} />}
                            componentsProps={{
                                actionBar: {
                                    actions: [],
                                },
                            }}
                        />
                        <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => {
                                setEndDate(newValue);
                                setSelectedDateFilterType('Custom Range');
                            }}
                            renderInput={(params) => <TextField {...params} />}
                            componentsProps={{
                                actionBar: {
                                    actions: [],
                                },
                            }}
                        />
                    </LocalizationProvider>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                <Button onClick={onClear} color="secondary">Clear</Button>
                <Button onClick={onApply} variant="contained" disabled={selectedDateFilterType === 'Custom Range' && (!startDate || !endDate)}>Apply</Button>
            </DialogActions>
        </Dialog>
    );
};


const Membertable = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWebsiteFilter, setSelectedWebsiteFilter] = useState('Website');
    const [selectedTags, setSelectedTags] = useState('Tags');
    const [selectedDateFilterType, setSelectedDateFilterType] = useState('Date');
    const [selectedAccount, setSelectedAccount] = useState('Accounts');
    const [selectedUser, setSelectedUser] = useState('Users');

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);

    // State for API data
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Date Filter Dialog
    const [dateFilterDialogOpen, setDateFilterDialogOpen] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const kanbanData = [
        { title: 'Due Today', count: 0 },
        { title: 'Due This Week', count: 0 },
        { title: 'Due Next Week', count: 0 },
        { title: 'Overdue', count: 2 },
    ];

    // Updated table headers
    const tableHeaders = [
        { id: 'userName', label: 'User Name', width: '20%' },
        { id: 'accountName', label: 'Account Name', width: '20%' },
        { id: 'dateCreated', label: 'Date Created', width: '15%' },
        { id: 'dateExpire', label: 'Date Expire', width: '15%' },
        { id: 'status', label: 'Status', width: '15%' },
        { id: 'rawFP', label: 'Raw FP', width: '15%' },
    ];

    // Fetch data from API
    useEffect(() => {
        const fetchTableData = async () => {
            setLoading(true);
            setError(null);
            try {
                const requestBody = {
                    search: searchTerm,
                    projectType: selectedWebsiteFilter === 'Website' ? undefined : selectedWebsiteFilter,
                    tags: selectedTags === 'Tags' ? undefined : selectedTags,
                    account: selectedAccount === 'Accounts' ? undefined : selectedAccount,
                    user: selectedUser === 'Users' ? undefined : selectedUser,
                };

                // Add date filter parameters based on selectedDateFilterType
                if (selectedDateFilterType === 'Custom Range' && startDate && endDate) {
                    requestBody.startDate = startDate.toISOString().split('T')[0];
                    requestBody.endDate = endDate.toISOString().split('T')[0];
                } else if (selectedDateFilterType !== 'Date') { // For predefined date ranges
                    requestBody.dueDateType = selectedDateFilterType;
                }

                const authToken = localStorage.getItem('authToken');

                if (!authToken) {
                    console.warn("Authentication token not found in localStorage. API call might fail.");
                    setError("Authentication required. Please log in.");
                    setLoading(false);
                    return;
                }

                const response = await axiosService.post('/mfa/token-transactions/list', requestBody, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                const fetchedData = response.data.transactions || [];
                setTableData(fetchedData);

                const newPageCount = Math.ceil(fetchedData.length / rowsPerPage);
                if (currentPage > newPageCount && newPageCount > 0) {
                    setCurrentPage(1);
                } else if (newPageCount === 0 && currentPage !== 1) {
                    setCurrentPage(1);
                }

            } catch (err) {
                console.error("Error fetching table data:", err);
                setError(err.response?.data?.message || "Failed to load data. Please ensure the API is running and accessible.");
                setTableData([]);
                setCurrentPage(1);
            } finally {
                setLoading(false);
            }
        };

        fetchTableData();
    }, [searchTerm, selectedWebsiteFilter, selectedTags, selectedDateFilterType, startDate, endDate,
        selectedAccount, selectedUser,
        rowsPerPage]);


    const paginatedRows = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const pageCount = Math.ceil(tableData.length / rowsPerPage);


    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedWebsiteFilter('Website');
        setSelectedTags('Tags');
        setSelectedDateFilterType('Date');
        setStartDate(null);
        setEndDate(null);
        setSelectedAccount('Accounts');
        setSelectedUser('Users');
        setCurrentPage(1);
        setSelectedRows([]);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSelectRow = (rowId) => {
        setSelectedRows(prev => {
            if (prev.includes(rowId)) {
                return prev.filter(id => id !== rowId);
            } else {
                return [...prev, rowId];
            }
        });
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedRows(tableData.map(row => row.id));
        } else {
            setSelectedRows([]);
        }
    };

    const isAllSelected = tableData.length > 0 && selectedRows.length === tableData.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < tableData.length;

    const handleApplyDateFilter = () => {
        setDateFilterDialogOpen(false);
    };

    const handleClearDateFilter = () => {
        setSelectedDateFilterType('Date');
        setStartDate(null);
        setEndDate(null);
        setDateFilterDialogOpen(false); // Close dialog on clear
    };

    return (
        <Box sx={{
            flexGrow: 1,
            backgroundColor: '#f0f2f5',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            px: { xs: 0, sm: 2, md: 4 },
            py: { xs: 2, sm: 3 },
            width: '100%',
        }}>
            <Container maxWidth="xl" sx={{
                py: { xs: 1, sm: 3 },
                px: { xs: 0.5, sm: 2, md: 4 },
                width: '100%',
                minWidth: 0,
            }}>
                {/* Kanban-style cards */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: { xs: 1, sm: 2 },
                        mb: { xs: 2, sm: 3 },
                    }}
                >
                    {kanbanData.map((col, index) => (
                        <StyledPaper key={index} sx={{
                            p: { xs: 1.5, sm: 2 },
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                                {col.count} {col.title}
                            </Typography>
                            <ArrowForward sx={{ color: '#888', fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                        </StyledPaper>
                    ))}
                </Box>

                {/* Filters Section */}
                <StyledPaper sx={{ p: { xs: 1, sm: 1.5 }, mb: { xs: 1.5, sm: 2 } }}>
                    {/* Search and Website Filter */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr auto' },
                        gap: 1.5,
                        alignItems: 'center',
                        mb: 1.5,
                    }}>
                        <StyledSearchTextField
                            variant="outlined"
                            size="small"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: '100%' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ fontSize: '1rem' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedWebsiteFilter}
                                onChange={(e) => setSelectedWebsiteFilter(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="Website">Website</MenuItem>
                                <MenuItem value="Mobile App">Mobile App</MenuItem>
                                <MenuItem value="Desktop App">Desktop App</MenuItem>
                            </StyledSelect>
                        </FormControl>
                        <Button
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                borderRadius: '6px',
                                backgroundColor: '#007bff',
                                '&:hover': { backgroundColor: '#0056b3' },
                                height: '40px',
                                fontSize: '0.8rem',
                                width: '100%',
                                gridColumn: { xs: '1', sm: 'span 2', md: 'auto' }
                            }}
                        >
                            Save<KeyboardArrowDown sx={{ ml: 0.5, fontSize: '1rem' }} />
                        </Button>
                    </Box>

                    {/* Additional Filters - Adjusted grid for better mobile stacking */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(auto-fill, minmax(150px, 1fr))' },
                        gap: 1,
                        alignItems: 'center',
                    }}>
                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedTags}
                                onChange={(e) => setSelectedTags(e.target.value)}
                                displayEmpty
                                startAdornment={<LocalOffer sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                            >
                                <MenuItem value="Tags">Tags</MenuItem>
                                <MenuItem value="New Tag Added">New Tag Added</MenuItem>
                                <MenuItem value="Getting Started">Getting Started</MenuItem>
                                <MenuItem value="Invalid Date">Invalid Date</MenuItem>
                                <MenuItem value="In Progress">In Progress</MenuItem>
                                <MenuItem value="Review">Review</MenuItem>
                                <MenuItem value="Testing">Testing</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        {/* Date Filter - Now directly opens the dialog */}
                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedDateFilterType} // Keep value for display if a predefined range is active
                                onClick={() => setDateFilterDialogOpen(true)} // Open dialog on click
                                displayEmpty
                                startAdornment={<Event sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                                // Disable default dropdown behavior, it's just a trigger now
                                MenuProps={{
                                    PaperProps: {
                                        sx: { display: 'none' } // Hide the default dropdown menu
                                    }
                                }}
                            >
                                {/* Only one option here, as it's just a trigger */}
                                <MenuItem value="Date">Date</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        {/* New Accounts Filter */}
                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                displayEmpty
                                startAdornment={<AccountBalance sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                            >
                                <MenuItem value="Accounts">Accounts</MenuItem>
                                <MenuItem value="Account 1">Account 1</MenuItem>
                                <MenuItem value="Account 2">Account 2</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        {/* New Users Filter */}
                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                displayEmpty
                                startAdornment={<Person sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                            >
                                <MenuItem value="Users">Users</MenuItem>
                                <MenuItem value="User 1">User 1</MenuItem>
                                <MenuItem value="User 2">User 2</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
                        <Button
                            variant="text"
                            onClick={handleClearFilters}
                            startIcon={<ClearIcon sx={{ fontSize: '1.1rem' }} />}
                            sx={{
                                textTransform: 'none',
                                color: '#6c757d',
                                fontSize: '0.75rem',
                                padding: '4px 8px',
                                width: { xs: '100%', sm: 'auto' },
                                justifySelf: { xs: 'stretch', sm: 'end' },
                                '&:hover': { backgroundColor: '#f8f9fa' }
                            }}
                        >
                            Clear
                        </Button>
                    </Box>
                </StyledPaper>

                {/* Table Section */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                        <Typography variant="h6" sx={{ ml: 2 }}>Loading data...</Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'error.main' }}>
                        <ErrorOutline sx={{ mr: 1 }} />
                        <Typography variant="h6">{error}</Typography>
                    </Box>
                ) : (
                    <TableContainer component={StyledPaper} sx={{ width: '100%', overflowX: 'auto' }}>
                        <Table sx={{ minWidth: { xs: 'auto', sm: '100%' } }} aria-label="project table">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            indeterminate={isIndeterminate}
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            sx={{ '& .MuiSvgIcon-root': { fontSize: '1.2rem' } }}
                                        />
                                    </TableCell>
                                    {tableHeaders.map((header) => (
                                        <TableCell
                                            key={header.id}
                                            sx={{
                                                fontWeight: 600,
                                                color: '#555',
                                                width: header.width,
                                                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                                py: 1.5,
                                                display: (header.id === 'userName' || header.id === 'accountName' || header.id === 'status')
                                                    ? 'table-cell'
                                                    : { xs: 'none', md: 'table-cell' }
                                            }}
                                        >
                                            {header.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={tableHeaders.length + 1} align="center">
                                            <CircularProgress size={32} />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && paginatedRows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#fdfdfd' } }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={selectedRows.includes(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                                sx={{ '& .MuiSvgIcon-root': { fontSize: '1.2rem' } }}
                                            />
                                        </TableCell>
                                        {/* User Name */}
                                        <TableCell component="th" scope="row" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                                                    {row.userName || 'N/A'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                                    {row.tags && row.tags.map((tag, tagIndex) => (
                                                        <StyledChip
                                                            key={tagIndex}
                                                            label={tag.text}
                                                            size="small"
                                                            deleteIcon={<CloseIcon />}
                                                            onDelete={() => { }}
                                                            sx={{
                                                                backgroundColor: tag.type === 'new' ? '#e8f5e9' : tag.type === 'started' ? '#e3f2fd' : tag.type === 'invalid' ? '#ffebee' : '#f0f0f0',
                                                                color: tag.type === 'new' ? '#4CAF50' : tag.type === 'started' ? '#2196F3' : tag.type === 'invalid' ? '#F44336' : '#555',
                                                                '& .MuiChip-deleteIcon': {
                                                                    color: tag.type === 'new' ? '#4CAF50' : tag.type === 'started' ? '#2196F3' : tag.type === 'invalid' ? '#F44336' : '#555',
                                                                    '&:hover': {
                                                                        color: tag.type === 'new' ? '#388E3C' : tag.type === 'started' ? '#1976D2' : tag.type === 'invalid' ? '#D32F2F' : '#333',
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                    ))}
                                                </Box>

                                                {/* Mobile-specific details (visible on xs and sm, hidden on md and up) */}
                                                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', mt: 1, gap: 0.5, backgroundColor: '#f8f9fa', borderRadius: 1, p: 1 }}>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Typography variant="caption" sx={{ color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>Account: {row.accountName || 'N/A'}</span>
                                                        <span>Status: {row.status || 'N/A'}</span>
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>Created: {row.dateCreated || 'N/A'}</span>
                                                        <span>Expire: {row.dateExpire || 'N/A'}</span>
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>Raw FP: {row.rawFP || 'N/A'}</span>
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        {/* Account Name */}
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.accountName || 'N/A'}</TableCell>
                                        {/* Date Created */}
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.dateCreated || 'N/A'}</TableCell>
                                        {/* Date Expire */}
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.dateExpire || 'N/A'}</TableCell>
                                        {/* Status */}
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.status || 'N/A'}</TableCell>
                                        {/* Raw FP */}
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.rawFP || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                                {!loading && paginatedRows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={tableHeaders.length + 1} align="center">
                                            No data available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Pagination */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: { xs: 2, sm: 3 },
                        gap: 1,
                        flexDirection: { xs: 'column', sm: 'row' },
                        width: '100%',
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '6px',
                            borderColor: '#ccc',
                            color: '#555',
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            padding: '6px 12px',
                            width: { xs: '100%', sm: 'auto' }
                        }}
                    >
                        Previous
                    </Button>
                    <FormControl size="small" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        {pageCount > 0 ? (
                            <StyledSelect
                                value={currentPage}
                                onChange={(e) => handlePageChange(e, e.target.value)}
                                sx={{ minWidth: { xs: '100%', sm: '60px' }, height: '32px' }}
                            >
                                {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                                    <MenuItem key={page} value={page}>{page}</MenuItem>
                                ))}
                            </StyledSelect>
                        ) : (
                            <TextField
                                value="1"
                                disabled
                                size="small"
                                sx={{ minWidth: { xs: '100%', sm: '60px' }, height: '32px', '& .MuiInputBase-input': { padding: '6px 10px' } }}
                            />
                        )}
                    </FormControl>
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={currentPage === pageCount}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '6px',
                            borderColor: '#ccc',
                            color: '#555',
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            padding: '6px 12px',
                            width: { xs: '100%', sm: 'auto' }
                        }}
                    >
                        Next
                    </Button>
                </Box>
            </Container>

            {/* Custom Date Filter Dialog */}
            <CustomDateFilterDialog
                open={dateFilterDialogOpen}
                onClose={() => setDateFilterDialogOpen(false)}
                selectedDateFilterType={selectedDateFilterType}
                setSelectedDateFilterType={setSelectedDateFilterType}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onApply={handleApplyDateFilter}
                onClear={handleClearDateFilter}
            />
        </Box>
    );
};

export default Membertable;