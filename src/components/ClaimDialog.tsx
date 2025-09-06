import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ClaimDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

export default function ClaimDialog({ open, onClose, onSubmit }: ClaimDialogProps) {
  const [message, setMessage] = React.useState("");

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit(message);
    setMessage(""); // reset after submit
    onClose();
  };

  return (
    <Dialog
  open={open}
  TransitionComponent={Transition}
  keepMounted
  onClose={onClose}
  aria-describedby="claim-dialog-description"
  PaperProps={{
    sx: {
      width: "500px", // make it wider
      borderRadius: "20px", // rounded corners
      p: 2,
      backgroundColor: "#FFFFFF", // white card style
      boxShadow: "0px 8px 24px rgba(0,0,0,0.15)", // soft modern shadow
    },
  }}
>
  <DialogTitle
    sx={{
      fontWeight: "semibold",
      fontSize: "1.4rem",
      color: "#388355", // theme primary color
      textAlign: "center",
    }}
  >
    Claim this Item
  </DialogTitle>

  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Why is this item yours?"
      type="text"
      fullWidth
      multiline
      minRows={3}
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
        },
      }}
    />
  </DialogContent>

  <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
    <Button
      onClick={onClose}
      sx={{
        color: "#CC1400", // neutral brown
        textTransform: "none",
        fontWeight: 600,
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleSubmit}
      variant="contained"
      sx={{
        backgroundColor: "#6478FF",
        borderRadius: "8px",
        px: 3,
        fontWeight: 400,
        textTransform: "none",
        "&:hover": {
          backgroundColor: "#388355", // orange accent on hover
        },
      }}
    >
      Submit Claim
    </Button>
  </DialogActions>
</Dialog>
  );
}
