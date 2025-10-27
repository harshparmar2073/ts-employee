import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl as MuiFormControl,
  InputLabel as MuiInputLabel,
  Select as MuiSelect,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Grid,
  Autocomplete,
} from '@mui/material';
import { useRef } from 'react';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  AccessTime,
  PlayArrow,
  Stop,
  HourglassEmpty,
  EmojiEvents,
  Edit,
  Delete,
} from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import JoditEditor from 'jodit-react';

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.3)',
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const joditEditorConfig = {
  readonly: false,
  toolbar: true,
  spellcheck: true,
  defaultActionOnPaste: 'insert_as_html',
  toolbarButtonSize: 'small',
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  height: 150,
  buttons: 'bold,italic,underline,strikethrough,|,ul,ol,|,indent,outdent,|,fontsize,paragraph,|,cut,copy,paste,|,undo,redo',
  buttonsMD: 'bold,italic,underline,strikethrough,|,ul,ol,|,fontsize,paragraph,|,undo,redo',
  buttonsSM: 'bold,italic,underline,strikethrough,|,ul,ol,|,undo,redo',
  buttonsXS: 'bold,italic,underline,strikethrough,|,ul,ol,|,undo,redo',
};

// Custom JoditEditor Wrapper to prevent re-initialization issues
const JoditEditorWrapper = ({ initialValue, onChange, config }) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState(initialValue);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleUpdate = (newContent) => {
    setContent(newContent);
    onChange(newContent);
  };

  return (
    <JoditEditor
      ref={editorRef}
      value={content}
      config={config}
      onBlur={newContent => handleUpdate(newContent)} // Use onBlur to update parent state less frequently
      onChange={newContent => {}} // onChange handled by onBlur, or more finely if needed
    />
  );
};

// TaskFormDialog Component
const TaskFormDialog = ({ open, handleClose, handleSave }) => {
  const editorDescription = useRef(null);
  const editorChallenges = useRef(null);

  const config = useMemo(() => ({ ...joditEditorConfig }), []); // Use the global config

  const [formData, setFormData] = useState({
    taskName: '',
    projectName: '',
    ticketNumber: [], // Changed to an array for multiple tickets
    description: '',
    hoursSpent: '',
    challenges: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTicketChange = (event, newValue) => {
    setFormData({ ...formData, ticketNumber: newValue });
  };

  const onSave = () => {
    handleSave(formData);
    setFormData({
      taskName: '',
      projectName: '',
      ticketNumber: [], // Reset to empty array
      description: '',
      hoursSpent: '',
      challenges: '',
    }); // Reset form after save
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md"> {/* Changed to md */}
      <DialogTitle>Add New Task</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="taskName"
          label="Task Name"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.taskName}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="projectName"
          label="Project Name"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.projectName}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={formData.ticketNumber}
          onChange={handleTicketChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={index} label={option} {...getTagProps({ index })} size="small" sx={{ bgcolor: '#e0e7fa', color: '#5e35b1' }} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              label="Ticket Numbers (e.g., JIRA-123)"
              placeholder="Add a ticket number"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}
        />
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Task Description</Typography>
        <JoditEditorWrapper
          initialValue={formData.description}
          onChange={(newContent) => setFormData({ ...formData, description: newContent })}
          config={config}
        />
        <Box sx={{ mb: 2 }} /> {/* Spacing after editor */}
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Challenges</Typography>
        <JoditEditorWrapper
          initialValue={formData.challenges}
          onChange={(newContent) => setFormData({ ...formData, challenges: newContent })}
          config={config}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const TaskSheet = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Unsubmitted', 'Overtime'
  const [sortOrder, setSortOrder] = useState('Newest First'); // 'Newest First', 'Oldest First', 'Project A-Z'
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

  const editorDescriptionRef = useRef(null);
  const editorChallengesRef = useRef(null);

  const joditConfig = useMemo(() => ({
    readonly: false,
    toolbar: true,
    spellcheck: true,
    defaultActionOnPaste: 'insert_as_html',
    toolbarButtonSize: 'small',
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    height: 150,
    buttons: 'bold,italic,underline,strikethrough,|,ul,ol,|,indent,outdent,|,fontsize,paragraph,|,cut,copy,paste,|,undo,redo',
    buttonsMD: 'bold,italic,underline,strikethrough,|,ul,ol,|,fontsize,paragraph,|,undo,redo',
    buttonsSM: 'bold,italic,underline,strikethrough,|,ul,ol,|,undo,redo',
    buttonsXS: 'bold,italic,underline,strikethrough,|,ul,ol,|,undo,redo',
  }), []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleMenuClick = (event, taskId) => {
    setSelectedTaskId(taskId);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTaskId(null);
  };

  const handleNewTaskDialogOpen = () => {
    setIsNewTaskDialogOpen(true);
  };

  const handleNewTaskDialogClose = () => {
    setIsNewTaskDialogOpen(false);
  };

  const handleSaveNewTask = (newTaskData) => {
    const newTask = {
      id: tasks.length + 1,
      ...newTaskData,
      startTime: null,
      endTime: null,
      status: 'Unsubmitted', // Default status for new tasks
      isEditing: false,
    };
    setTasks([...tasks, newTask]);
    handleNewTaskDialogClose();
  };

  const handleTaskChange = (id, field, value) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, [field]: value } : task));
  };

  const startTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id && !task.startTime ? { ...task, startTime: new Date().toISOString() } : task
    ));
  };

  const endTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id && task.startTime && !task.endTime ? { ...task, endTime: new Date().toISOString() } : task
    ));
  };

  const toggleEditMode = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return { ...task, isEditing: !task.isEditing };
      }
      return task;
    }));
    handleMenuClose();
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    handleMenuClose();
  };

  const calculateTaskHours = (task) => {
    if (task.startTime && task.endTime) {
      const start = new Date(task.startTime);
      const end = new Date(task.endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours.toFixed(2);
    }
    return 0;
  };

  // Filtered and Sorted Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortOrder === 'Newest First') {
      return new Date(b.startTime) - new Date(a.startTime);
    } else if (sortOrder === 'Oldest First') {
      return new Date(a.startTime) - new Date(b.startTime);
    } else if (sortOrder === 'Project A-Z') {
      return a.projectName.localeCompare(b.projectName);
    }
    return 0;
  });

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const dateKey = task.startTime ? format(new Date(task.startTime), 'PPP') : 'No Date';
    if (!acc[dateKey]) {
      acc[dateKey] = { tasks: [], totalHours: 0, totalCost: 0 };
    }
    acc[dateKey].tasks.push(task);
    acc[dateKey].totalHours += parseFloat(calculateTaskHours(task));
    return acc;
  }, {});

  const handleFilterMenuClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortMenuClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleSettingsMenuClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f9f9fb', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Task Sheet
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search for anything here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250, borderRadius: 1, backgroundColor: '#fff' }}
          />
          <IconButton size="small" onClick={handleFilterMenuClick}><FilterListIcon /></IconButton>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterMenuClose}
          >
            <MenuItem onClick={() => { setFilterStatus('All'); handleFilterMenuClose(); }}>All Tasks</MenuItem>
            <MenuItem onClick={() => { setFilterStatus('Unsubmitted'); handleFilterMenuClose(); }}>Unsubmitted</MenuItem>
            <MenuItem onClick={() => { setFilterStatus('Overtime'); handleFilterMenuClose(); }}>Overtime</MenuItem>
            {/* Add more filter options here */}
          </Menu>
          <IconButton size="small" onClick={handleSortMenuClick}><SortIcon /></IconButton>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortMenuClose}
          >
            <MenuItem onClick={() => { setSortOrder('Newest First'); handleSortMenuClose(); }}>Date (Newest First)</MenuItem>
            <MenuItem onClick={() => { setSortOrder('Oldest First'); setSortOrder('Oldest First'); handleSortMenuClose(); }}>Date (Oldest First)</MenuItem>
            <MenuItem onClick={() => { setSortOrder('Project A-Z'); handleSortMenuClose(); }}>Project Name (A-Z)</MenuItem>
            {/* Add more sort options here */}
          </Menu>
          <IconButton size="small" onClick={handleSettingsMenuClick}><SettingsIcon /></IconButton>
          <Menu
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl)}
            onClose={handleSettingsMenuClose}
          >
            <MenuItem onClick={() => { console.log('Exporting data...'); handleSettingsMenuClose(); }}>Export</MenuItem>
            <MenuItem onClick={() => { console.log('Customizing columns...'); handleSettingsMenuClose(); }}>Customize Columns</MenuItem>
            {/* Add more settings options here */}
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ textTransform: 'none' }} onClick={handleNewTaskDialogOpen}>
            Create New
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="task sheet tabs">
          <StyledTab label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Timesheet
              <Chip label={filteredTasks.length} size="small" sx={{ ml: 1, bgcolor: '#e0e7fa', color: '#5e35b1' }} />
            </Box>
          } />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{format(new Date(), 'MMM dd')} - {format(new Date(new Date().setDate(new Date().getDate() + 7)), 'MMM dd, yyyy')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => console.log('Showing this week\'s tasks...')}>This Week</Button>
        </Box>
      </Box>

      <TabPanel value={currentTab} index={0}>
        {Object.keys(groupedTasks).length === 0 && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            No tasks yet. Click "Create New" to add a task.
          </Typography>
        )}
        {Object.keys(groupedTasks).sort((a, b) => new Date(b) - new Date(a)).map(date => (
          <Box key={date} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{date}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total: <Typography component="span" sx={{ fontWeight: 'bold', color: '#4caf50' }}>{groupedTasks[date].totalHours.toFixed(2)}h</Typography>
                </Typography>
              </Box>
            </Box>
            {groupedTasks[date].tasks.map((task) => (
              <Paper
                key={task.id}
                elevation={0}
                sx={{
                  mb: 1.5,
                  p: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                  borderLeft: task.status === 'Overtime' ? '4px solid #ef5350' : '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, mr: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>{task.taskName || 'No Task Name'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.projectName || 'No Project'}</Typography>
                  {task.ticketNumber && task.ticketNumber.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {task.ticketNumber.map((ticket, idx) => (
                        <Chip key={idx} label={ticket} size="small" sx={{ bgcolor: '#e0e7fa', color: '#5e35b1' }} />
                      ))}
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: '250px', justifyContent: 'flex-end', flexGrow: { xs: 1, sm: 0 } }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2" color="text.primary">
                    {task.startTime ? format(new Date(task.startTime), 'HH:mm') : '--:--'} - {task.endTime ? format(new Date(task.endTime), 'HH:mm') : '--:--'}
                  </Typography>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <HourglassEmpty fontSize="small" color="action" />
                  <Typography variant="body2" color="text.primary">
                    {calculateTaskHours(task)}h
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={task.startTime && !task.endTime ? <Stop /> : <PlayArrow />}
                    onClick={() => (task.startTime && !task.endTime ? endTask(task.id) : startTask(task.id))}
                    disabled={!!task.endTime}
                    color={task.startTime && !task.endTime ? 'error' : 'primary'}
                    sx={{
                      textTransform: 'none',
                      backgroundColor: task.startTime && !task.endTime ? '#ef5350' : '#e0e0e0',
                      color: '#333',
                      '&:hover': {
                        backgroundColor: task.startTime && !task.endTime ? '#e53935' : '#d0d0d0',
                      },
                    }}
                  >
                    {task.startTime && !task.endTime ? 'Stop' : 'Start'}
                  </Button>
                  <IconButton
                    aria-label="more"
                    aria-controls={`task-menu-${task.id}`}
                    aria-haspopup="true"
                    onClick={(event) => handleMenuClick(event, task.id)}
                    size="small"
                    sx={{ color: '#333' }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id={`task-menu-${task.id}`}
                    MenuListProps={{
                      'aria-labelledby': 'long-button',
                    }}
                    anchorEl={anchorEl}
                    open={openMenu && selectedTaskId === task.id}
                    onClose={handleMenuClose}
                    PaperProps={{
                      style: {
                        maxHeight: 48 * 4.5,
                        width: '20ch',
                      },
                    }}
                  >
                    <MenuItem onClick={() => toggleEditMode(task.id)}>
                      <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                      <ListItemText>Edit</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => deleteTask(task.id)}>
                      <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
                      <ListItemText>Delete</ListItemText>
                    </MenuItem>
                  </Menu>
                </Box>
                {task.isEditing && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee', width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Task Name"
                      value={task.taskName}
                      onChange={(e) => handleTaskChange(task.id, 'taskName', e.target.value)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Project Name"
                      value={task.projectName}
                      onChange={(e) => handleTaskChange(task.id, 'projectName', e.target.value)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={task.ticketNumber}
                      onChange={(event, newValue) => handleTaskChange(task.id, 'ticketNumber', newValue)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip key={index} label={option} {...getTagProps({ index })} size="small" sx={{ bgcolor: '#e0e7fa', color: '#5e35b1' }} />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          margin="dense"
                          label="Ticket Numbers (e.g., JIRA-123)"
                          placeholder="Add a ticket number"
                          fullWidth
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      )}
                    />
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Task Description</Typography>
                    <JoditEditorWrapper
                      initialValue={task.description}
                      onChange={(newContent) => handleTaskChange(task.id, 'description', newContent)}
                      config={joditConfig}
                    />
                    <Box sx={{ mb: 1 }} /> {/* Spacing after editor */}
                    <TextField
                      fullWidth
                      label="Hours Spent"
                      type="number"
                      value={task.hoursSpent}
                      onChange={(e) => handleTaskChange(task.id, 'hoursSpent', e.target.value)}
                      size="small"
                      sx={{ mb: 1 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HourglassEmpty fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Challenges</Typography>
                    <JoditEditorWrapper
                      initialValue={task.challenges}
                      onChange={(newContent) => handleTaskChange(task.id, 'challenges', newContent)}
                      config={joditConfig}
                    />
                    <Box sx={{ mb: 1 }} /> {/* Spacing after editor */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                      <Button variant="outlined" size="small" onClick={() => toggleEditMode(task.id)}>Cancel</Button>
                      <Button variant="contained" size="small" onClick={() => toggleEditMode(task.id)}>Save</Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        ))}
      </TabPanel>

      <TaskFormDialog
        open={isNewTaskDialogOpen}
        handleClose={handleNewTaskDialogClose}
        handleSave={handleSaveNewTask}
      />
    </Box>
  );
};

export default TaskSheet;
