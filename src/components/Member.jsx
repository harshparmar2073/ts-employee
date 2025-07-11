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
    List as ListIcon,
    CalendarMonth,
    NotificationsNone,
    SettingsOutlined,
    KeyboardArrowDown,
    Search,
    ArrowForward,
    Close as CloseIcon,
    LocalOffer,
    Event,
    AccountBalance,
    Person,
    Group,
    Business,
    FolderOpen,
    Clear,
    FilterAltOff,
    ErrorOutline
} from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';

// Date Picker Imports
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'; // Using StaticDatePicker for inline calendar

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
    const [selectedAccountingPeriod, setSelectedAccountingPeriod] = useState('Accounting Period');
    const [selectedAssignee, setSelectedAssignee] = useState('Assignee');
    const [selectedShowAllAssignees, setSelectedShowAllAssignees] = useState('Show All Assignees');
    const [selectedClients, setSelectedClients] = useState('Clients');
    const [selectedClientGroups, setSelectedClientGroups] = useState('Client Groups');
    const [selectedOpen, setSelectedOpen] = useState('Open');
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

    const tableHeaders = [
        { id: 'title', label: 'Title', width: '30%' },
        { id: 'client', label: 'Client', width: '15%' },
        { id: 'teamChat', label: 'Team Chat', width: '10%' },
        { id: 'clientTasks', label: 'Client Tasks', width: '10%' },
        { id: 'actualBudget', label: 'Actual/Budget', width: '10%' },
        { id: 'startDate', label: 'Start Date', width: '10%' },
        { id: 'dueDate', label: 'Due Date', width: '10%' },
        { id: 'assignees', label: 'Assignees', width: '5%' },
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
                    accountingPeriod: selectedAccountingPeriod === 'Accounting Period' ? undefined : selectedAccountingPeriod,
                    assignee: selectedAssignee === 'Assignee' ? undefined : selectedAssignee,
                    client: selectedClients === 'Clients' ? undefined : selectedClients,
                    clientGroup: selectedClientGroups === 'Client Groups' ? undefined : selectedClientGroups,
                    status: selectedOpen === 'Open' ? undefined : selectedOpen,
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
        selectedAccountingPeriod, selectedAssignee, selectedClients, selectedClientGroups, selectedOpen, rowsPerPage]);


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
        setSelectedAccountingPeriod('Accounting Period');
        setSelectedAssignee('Assignee');
        setSelectedShowAllAssignees('Show All Assignees');
        setSelectedClients('Clients');
        setSelectedClientGroups('Client Groups');
        setSelectedOpen('Open');
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
                                <MenuItem value="Review">Review</MenuItem> {/* Corrected closing tag */}
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

                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedAccountingPeriod}
                                onChange={(e) => setSelectedAccountingPeriod(e.target.value)}
                                displayEmpty
                                startAdornment={<AccountBalance sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                            >
                                <MenuItem value="Accounting Period">Period</MenuItem>
                                <MenuItem value="Q1 2024">Q1 2024</MenuItem>
                                <MenuItem value="Q2 2024">Q2 2024</MenuItem>
                                <MenuItem value="Q3 2024">Q3 2024</MenuItem>
                                <MenuItem value="Q4 2024">Q4 2024</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedAssignee}
                                onChange={(e) => setSelectedAssignee(e.target.value)}
                                displayEmpty
                                startAdornment={<Person sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                            >
                                <MenuItem value="Assignee">Assignee</MenuItem>
                                <MenuItem value="DT">DT</MenuItem>
                                <MenuItem value="FM">FM</MenuItem>
                                <MenuItem value="JD">JD</MenuItem>
                                <MenuItem value="AB">AB</MenuItem>
                                <MenuItem value="CD">CD</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedShowAllAssignees}
                                onChange={(e) => setSelectedShowAllAssignees(e.target.value)}
                                displayEmpty
                                startAdornment={<Group sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                            >
                                <MenuItem value="Show All Assignees">All</MenuItem>
                                <MenuItem value="Show Active Only">Active</MenuItem>
                                <MenuItem value="Show Inactive Only">Inactive</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedClients}
                                onChange={(e) => setSelectedClients(e.target.value)}
                                displayEmpty
                                startAdornment={<Business sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                            >
                                <MenuItem value="Clients">Clients</MenuItem>
                                <MenuItem value="Customer Shab">Customer Shab</MenuItem>
                                <MenuItem value="Abby">Abby</MenuItem>
                                <MenuItem value="Tech Corp">Tech Corp</MenuItem>
                                <MenuItem value="Shop Inc">Shop Inc</MenuItem>
                                <MenuItem value="Data Co">Data Co</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedClientGroups}
                                onChange={(e) => setSelectedClientGroups(e.target.value)}
                                displayEmpty
                                startAdornment={<Group sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                            >
                                <MenuItem value="Client Groups">Groups</MenuItem>
                                <MenuItem value="Enterprise">Enterprise</MenuItem>
                                <MenuItem value="SMB">SMB</MenuItem>
                                <MenuItem value="Startup">Startup</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        <FormControl size="small" sx={{ width: '100%' }}>
                            <StyledSelect
                                value={selectedOpen}
                                onChange={(e) => setSelectedOpen(e.target.value)}
                                displayEmpty
                                startAdornment={<FolderOpen sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                            >
                                <MenuItem value="Open">Open</MenuItem>
                                <MenuItem value="Closed">Closed</MenuItem>
                                <MenuItem value="In Progress">In Progress</MenuItem>
                                <MenuItem value="On Hold">On Hold</MenuItem>
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
                                    <TableCell
                                        sx={{ fontWeight: 600, color: '#555', width: '100%', fontSize: { xs: '0.75rem', sm: '0.85rem' }, py: 1.5 }}
                                    >
                                        Title
                                    </TableCell>
                                    {tableHeaders.slice(1).map((header) => (
                                        <TableCell
                                            key={header.id}
                                            sx={{
                                                fontWeight: 600,
                                                color: '#555',
                                                width: header.width,
                                                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                                py: 1.5,
                                                display: { xs: 'none', md: 'table-cell' }
                                            }}
                                        >
                                            {header.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedRows.map((row) => (
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
                                        <TableCell component="th" scope="row" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                                                    {row.title}
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
                                                        <span>Client: {row.client}</span>
                                                        <span>Team Chat: {row.teamChat || 'N/A'}</span>
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>Start: {row.startDate}</span>
                                                        <span>Due: <span style={{ color: row.isOverdue ? '#F44336' : '#333' }}>{row.dueDate}</span></span>
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>Tasks: {row.clientTasks || 'N/A'}</span>
                                                        <span>Budget: {row.actualBudget || 'N/A'}</span>
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                        <Typography variant="caption" sx={{ color: '#666' }}>Assignees:</Typography>
                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                            {row.assignees && row.assignees.map((assignee, idx) => (
                                                                <Avatar key={idx} sx={{ width: 20, height: 20, fontSize: '0.6rem', bgcolor: assignee.color }}>{assignee.initial}</Avatar>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        {/* Regular table cells, hidden on mobile and medium screens */}
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.client}</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.teamChat}</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.clientTasks}</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.actualBudget}</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.startDate}</TableCell>
                                        <TableCell sx={{ color: row.isOverdue ? '#F44336' : '#333', fontWeight: row.isOverdue ? 600 : 400, fontSize: { xs: '0.75rem', sm: '0.85rem' }, display: { xs: 'none', md: 'table-cell' } }}>{row.dueDate}</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                {row.assignees && row.assignees.map((assignee, idx) => (
                                                    <Avatar key={idx} sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: assignee.color, mr: 0.5 }}>{assignee.initial}</Avatar>
                                                ))}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
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