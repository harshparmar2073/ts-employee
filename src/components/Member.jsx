import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Container, Paper,
    Tabs, Tab, IconButton, TextField, InputAdornment, Chip, Avatar,
    TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Checkbox,
    Select, MenuItem, FormControl, Pagination
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
    List as ListIcon, CalendarMonth, NotificationsNone, SettingsOutlined,
    KeyboardArrowDown, Search, ArrowForward, Close as CloseIcon,
    LocalOffer, Event, AccountBalance, Person, Group, Business, FolderOpen, Clear, FilterAltOff
} from '@mui/icons-material';
import Layout from '../theme/Layout'; // <-- Use your theme Layout
import ClearIcon from '@mui/icons-material/Clear';

const userData = {
    name: 'John Doe',
    initials: 'JD',
    email: 'john.doe@example.com'
};

// Define custom styled components to match the image's aesthetics

// Styled AppBar for the top navigation bar
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: 'none',
}));

// Styled Toolbar to ensure proper spacing and alignment
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

// Styled Tabs for the "List View" and "Calendar View"
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

// Styled Button for "Reminders"
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

// Styled Paper for Kanban-style columns and filter bar
const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    boxShadow: 'none',
}));

// Styled TextField for search input
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
}));

// Styled Select for filter dropdowns
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
}));

// Styled Chip for tags
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

// Main Dashboard Component
const Membertable = () => {
    // State for tabs, filters, table data
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWebsiteFilter, setSelectedWebsiteFilter] = useState('Website'); // Corresponds to the 'Title' column's project type
    const [selectedTags, setSelectedTags] = useState('Tags');
    const [selectedDueDate, setSelectedDueDate] = useState('Due Date');
    const [selectedAccountingPeriod, setSelectedAccountingPeriod] = useState('Accounting Period');
    const [selectedAssignee, setSelectedAssignee] = useState('Assignee');
    const [selectedShowAllAssignees, setSelectedShowAllAssignees] = useState('Show All Assignees');
    const [selectedClients, setSelectedClients] = useState('Clients');
    const [selectedClientGroups, setSelectedClientGroups] = useState('Client Groups');
    const [selectedOpen, setSelectedOpen] = useState('Open');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Mock Data
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

    const allTableRows = [ // Renamed to allTableRows for clarity
        {
            id: 1,
            title: 'Website',
            projectType: 'Website', // Added projectType for 'Website' filter
            tags: [{ text: 'New Tag Added', type: 'new' }, { text: 'Getting Started', type: 'started' }],
            client: 'Customer Shab',
            teamChat: 30,
            clientTasks: '5/17',
            actualBudget: '',
            startDate: 'Jun 20th',
            dueDate: 'Jun 20th',
            assignees: [{ initial: 'DT', color: '#4CAF50' }],
            isOverdue: true,
            accountingPeriod: 'Q2 2024', // Added for Accounting Period filter
            status: 'Open' // Added for Open/Closed filter
        },
        {
            id: 2,
            title: 'Website Redesign updated on',
            projectType: 'Website',
            tags: [{ text: 'Invalid Date', type: 'invalid' }],
            client: 'Abby',
            teamChat: '',
            clientTasks: '',
            actualBudget: '',
            startDate: 'Feb 24th',
            dueDate: 'Jun 30th',
            assignees: [{ initial: 'FM', color: '#FFC107' }],
            isOverdue: true,
            accountingPeriod: 'Q2 2024',
            status: 'Open'
        }
    ];

    // Filter the table rows based on search term and all filter states
    const filteredRows = allTableRows.filter(row => {
        const matchesSearch = searchTerm === '' ||
            row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.client.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesWebsite = selectedWebsiteFilter === 'Website' || row.projectType === selectedWebsiteFilter;

        const matchesTags = selectedTags === 'Tags' ||
            row.tags.some(tag => tag.text === selectedTags);

        // For Due Date, we need to compare against actual dates or a simplified string
        // For simplicity, let's assume 'Due Date' filter values match the 'dueDate' string
        const matchesDueDate = selectedDueDate === 'Due Date' ||
            (selectedDueDate === 'Overdue' && row.isOverdue) ||
            (selectedDueDate === 'Today' && row.dueDate === 'Jul 9th') || // Example: assuming today is Jul 9th
            (selectedDueDate === 'This Week' && (row.dueDate === 'Jul 10th' || row.dueDate === 'Jul 15th')) || // Example
            (selectedDueDate === 'Next Week' && (row.dueDate === 'Jul 20th')); // Example
            // More robust date comparisons would be needed for a real app

        const matchesAccountingPeriod = selectedAccountingPeriod === 'Accounting Period' || row.accountingPeriod === selectedAccountingPeriod;

        const matchesAssignee = selectedAssignee === 'Assignee' ||
            row.assignees.some(assignee => assignee.initial === selectedAssignee);

        // 'Show All Assignees' filter doesn't change the data, it's a display option
        // For 'Show Active Only'/'Show Inactive Only', you'd need an 'isActive' property on assignees

        const matchesClients = selectedClients === 'Clients' || row.client === selectedClients;

        // Assuming client groups are derived from client names or a separate property
        // For simplicity, let's map some clients to mock groups
        const clientGroupsMap = {
            'Customer Shab': 'SMB',
            'Abby': 'SMB',
            'Tech Corp': 'Enterprise',
            'Shop Inc': 'Startup',
            'Data Co': 'Enterprise'
        };
        const matchesClientGroups = selectedClientGroups === 'Client Groups' || clientGroupsMap[row.client] === selectedClientGroups;

        const matchesOpen = selectedOpen === 'Open' || row.status === selectedOpen;


        return matchesSearch && matchesWebsite && matchesTags && matchesDueDate &&
               matchesAccountingPeriod && matchesAssignee && matchesClients &&
               matchesClientGroups && matchesOpen;
    });

    // Paginated rows
    const paginatedRows = filteredRows.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );
    const pageCount = Math.ceil(filteredRows.length / rowsPerPage);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedWebsiteFilter('Website');
        setSelectedTags('Tags');
        setSelectedDueDate('Due Date');
        setSelectedAccountingPeriod('Accounting Period');
        setSelectedAssignee('Assignee');
        setSelectedShowAllAssignees('Show All Assignees');
        setSelectedClients('Clients');
        setSelectedClientGroups('Client Groups');
        setSelectedOpen('Open');
        setCurrentPage(1);
        setSelectedRows([]);
    };

    // Pagination handlers
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // Handle row selection
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
            // Select all filtered rows, not just paginated ones
            setSelectedRows(filteredRows.map(row => row.id));
        } else {
            setSelectedRows([]);
        }
    };

    const isAllSelected = filteredRows.length > 0 && selectedRows.length === filteredRows.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < filteredRows.length;

    return (
        <Layout userData={userData}>
        <Box sx={{ flexGrow: 1, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
                {/* REMOVE the custom AppBar/Toolbar/Tabs here */}
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Kanban-style columns */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            mb: 3,
                            flexWrap: { xs: 'wrap', md: 'nowrap' },
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: { xs: 'flex-start', sm: 'space-between' }
                        }}
                    >
                    {kanbanData.map((col, index) => (
                        <StyledPaper key={index} sx={{
                                flex: '1 1 22%',
                            minWidth: '180px',
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '1.1rem' }}>
                                {col.count} {col.title}
                            </Typography>
                            <ArrowForward sx={{ color: '#888', fontSize: '1.2rem' }} />
                        </StyledPaper>
                    ))}
                </Box>

                    {/* Filter Bar - Single Row */}
                    <StyledPaper sx={{ p: { xs: 1, sm: 1.5 }, mb: 2 }}>
                        {/* First Row: Search, Website Filter, Save Button */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                alignItems: 'center',
                                mb: 1.5,
                                flexDirection: { xs: 'column', sm: 'row' }
                            }}
                        >
                        <StyledSearchTextField
                            variant="outlined"
                            size="small"
                                placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                                fullWidth={true}
                                sx={{ maxWidth: { xs: '100%', sm: 200 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                            <Search sx={{ fontSize: '1rem' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl size="small">
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
                                    height: '32px',
                                    fontSize: '0.8rem',
                                    minWidth: '70px'
                                }}
                            >
                                Save
                                <KeyboardArrowDown sx={{ ml: 0.5, fontSize: '1rem' }} />
                        </Button>
                        </Box>

                        {/* Second Row: All other filters and Clear button */}
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            alignItems: 'center',
                            '& > *': { flexShrink: 0 }
                        }}>
                            <FormControl size="small">
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

                            <FormControl size="small">
                                <StyledSelect
                                    value={selectedDueDate}
                                    onChange={(e) => setSelectedDueDate(e.target.value)}
                                    displayEmpty
                                    startAdornment={<Event sx={{ fontSize: '0.9rem', mr: 0.5, color: '#666' }} />}
                                >
                                    <MenuItem value="Due Date">Due Date</MenuItem>
                                    <MenuItem value="Today">Today</MenuItem>
                                    <MenuItem value="This Week">This Week</MenuItem>
                                    <MenuItem value="Next Week">Next Week</MenuItem>
                                    <MenuItem value="Overdue">Overdue</MenuItem>
                                </StyledSelect>
                            </FormControl>

                            <FormControl size="small">
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

                            <FormControl size="small">
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

                            <FormControl size="small">
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

                            <FormControl size="small">
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

                            <FormControl size="small">
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

                            <FormControl size="small">
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

                            <Box sx={{ flexGrow: 1 }} />
                            <Button
                                variant="text"
                                onClick={handleClearFilters}
                                startIcon={<ClearIcon sx={{ fontSize: '1.1rem' }} />}
                                sx={{
                                    textTransform: 'none',
                                    color: '#6c757d',
                                    fontSize: '0.75rem',
                                    minWidth: 'auto',
                                    padding: '4px 8px',
                                    '&:hover': {
                                        backgroundColor: '#f8f9fa'
                                    }
                                }}
                            >
                                Clear
                        </Button>
                    </Box>
                </StyledPaper>


                {/* Table/List View */}
                    <TableContainer component={StyledPaper} sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="project table">
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
                                        sx={{ fontWeight: 600, color: '#555', width: header.width, fontSize: '0.85rem', py: 1.5 }}
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
                                    <TableCell component="th" scope="row" sx={{ fontSize: '0.85rem' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{row.title}</Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                                {row.tags && row.tags.map((tag, tagIndex) => (
                                                    <StyledChip
                                                        key={tagIndex}
                                                        label={tag.text}
                                                        size="small"
                                                        deleteIcon={<CloseIcon />}
                                                        onDelete={() => { /* Handle tag delete */ }}
                                                        sx={{
                                                            backgroundColor:
                                                                    tag.type === 'new' ? '#e8f5e9' :
                                                                    tag.type === 'started' ? '#e3f2fd' :
                                                                    tag.type === 'invalid' ? '#ffebee' :
                                                                '#f0f0f0',
                                                            color:
                                                                tag.type === 'new' ? '#4CAF50' :
                                                                tag.type === 'started' ? '#2196F3' :
                                                                tag.type === 'invalid' ? '#F44336' :
                                                                '#555',
                                                            '& .MuiChip-deleteIcon': {
                                                                color:
                                                                    tag.type === 'new' ? '#4CAF50' :
                                                                    tag.type === 'started' ? '#2196F3' :
                                                                    tag.type === 'invalid' ? '#F44336' :
                                                                    '#555',
                                                                '&:hover': {
                                                                    color:
                                                                        tag.type === 'new' ? '#388E3C' :
                                                                        tag.type === 'started' ? '#1976D2' :
                                                                        tag.type === 'invalid' ? '#D32F2F' :
                                                                        '#333',
                                                                }
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.85rem' }}>{row.client}</TableCell>
                                    <TableCell sx={{ fontSize: '0.85rem' }}>{row.teamChat}</TableCell>
                                    <TableCell sx={{ fontSize: '0.85rem' }}>{row.clientTasks}</TableCell>
                                    <TableCell sx={{ fontSize: '0.85rem' }}>{row.actualBudget}</TableCell>
                                    <TableCell sx={{ fontSize: '0.85rem' }}>{row.startDate}</TableCell>
                                    <TableCell sx={{ color: row.isOverdue ? '#F44336' : '#333', fontWeight: row.isOverdue ? 600 : 400, fontSize: '0.85rem' }}>{row.dueDate}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            {row.assignees && row.assignees.map((assignee, idx) => (
                                                <Avatar key={idx} sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: assignee.color }}>
                                                    {assignee.initial}
                                                </Avatar>
                                            ))}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mt: 3,
                            gap: 1,
                            flexDirection: { xs: 'column', sm: 'row' }
                        }}
                    >
                    <Button variant="outlined" size="small" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}
                        sx={{ textTransform: 'none', borderRadius: '6px', borderColor: '#ccc', color: '#555', fontSize: '0.85rem', padding: '6px 12px' }}>
                        Previous
                    </Button>
                    <FormControl size="small">
                        <StyledSelect
                            value={currentPage}
                            onChange={(e) => handlePageChange(e, e.target.value)}
                            sx={{ minWidth: '60px', height: '32px' }} // Smaller select for page number
                        >
                            {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                                <MenuItem key={page} value={page}>{page}</MenuItem>
                            ))}
                        </StyledSelect>
                    </FormControl>
                    <Button variant="outlined" size="small" disabled={currentPage === pageCount} onClick={() => setCurrentPage(prev => prev + 1)}
                        sx={{ textTransform: 'none', borderRadius: '6px', borderColor: '#ccc', color: '#555', fontSize: '0.85rem', padding: '6px 12px' }}>
                        Next
                    </Button>
                </Box>
            </Container>
        </Box>
        </Layout>
    );
};

export default Membertable;