import React, { useEffect, useState, forwardRef } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Slide,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import axiosService from "../services/axiosService";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Chip } from "@mui/material";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const TokenSessions = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedFingerprint, setSelectedFingerprint] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchSessions = async (filter = null) => {
    setLoading(true);
    try {
      const payload = filter || {};
      const res = await axiosService.post(
        "/mfa/token-transactions/list",
        payload
      );
      setRows(res.data?.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch token sessions:", error);
    }
    setLoading(false);
  };

  const revokeTransaction = async (row) => {
    if (!row) return;
    setLoading(true);
    try {
      await axiosService.post("/mfa/token-transactions/revoke", row);
      await fetchSessions();
    } catch (error) {
      console.error("❌ Failed to revoke session:", error);
    }
    setLoading(false);
  };

  const handleFilter = () => {
    if (startDate && endDate) {
      fetchSessions({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
    }
  };

  const openFingerprintDialog = (fingerprint) => {
    setSelectedFingerprint(fingerprint);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const columns = [
    { field: "authName", headerName: "User", flex: 1 },
    { field: "accountName", headerName: "Acount Name", flex: 1 },
    {
      field: "createdDate",
      headerName: "Created On",
      flex: 1,
      renderCell: (params) => params.row.createdDate || "-",
    },
    {
      field: "authTokenExpireDate",
      headerName: "Token Expiry",
      flex: 1,
      renderCell: (params) => params.row.authTokenExpireDate || "-",
    },
    {
      field: "plainDeviceFingerPrint",
      headerName: "Plain Fingerprint",
      flex: 1,
      renderCell: (params) =>
        params.row.plainDeviceFingerPrint ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              openFingerprintDialog(params.row.plainDeviceFingerPrint)
            }
          >
            Show
          </Button>
        ) : (
          "-"
        ),
    },
    {
      field: "authRememberMeExp",
      headerName: "Remember Me Expiry",
      flex: 1,
      renderCell: (params) => {
        const { authRememberMe, authRememberMeExp } = params.row;
        if (authRememberMe && authRememberMeExp) {
          return (
            <Chip
              label={authRememberMeExp}
              color="primary"
              variant="outlined"
              size="small"
            />
          );
        }
        return "-";
      },
    },
    {
      field: "rememberMe",
      headerName: "Checked?",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => {
        const { authRememberMe } = params.row;
        return authRememberMe ? (
          <Chip
            label="Remember Me"
            size="small"
            sx={{
              fontWeight: 600,
              borderRadius: "6px",
              px: 1.5,
              background: "linear-gradient(135deg, #c8e6c9, #a5d6a7)",
              color: "#1b5e20",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
              border: "1px solid #81c784",
            }}
          />
        ) : (
          "-"
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Revoke Session">
          <IconButton
            color="error"
            onClick={() => revokeTransaction(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4, maxWidth: "100%" }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Active Sessions
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newVal) => setStartDate(newVal)}
            slotProps={{ textField: { size: "small" } }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newVal) => setEndDate(newVal)}
            slotProps={{ textField: { size: "small" } }}
          />
          <Button
            variant="contained"
            onClick={handleFilter}
            sx={{ height: 40 }}
          >
            Filter
          </Button>
        </Box>
      </LocalizationProvider>

      <Paper
        elevation={7}
        sx={{
          p: 3,
          mt: 6,
          borderRadius: 4,
          background: "linear-gradient(135deg, #e0f7fa, #f1f8e9)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={rows}
              getRowId={(row) => row.id}
              columns={columns}
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#f9f9f9",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#e3f2fd",
                  cursor: "pointer",
                },
                border: "none",
                fontSize: "0.95rem",
              }}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Box>
        )}
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #fafafa, #e3f2fd)",
            boxShadow: 24,
            p: 2,
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} pb={1}>
          <Typography variant="h6" fontWeight={600}>
            Device Fingerprint
          </Typography>
          <IconButton onClick={() => setDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <DialogContent
          dividers
          sx={{
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            fontSize: "0.9rem",
            color: "#333",
            background: "#ffffff",
            borderRadius: 2,
            mt: 2,
            mb: 2,
          }}
        >
          {selectedFingerprint
            ?.replace(/786/, "")
            .replace(/786$/, "")}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TokenSessions;