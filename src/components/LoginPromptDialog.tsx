import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide, { SlideProps } from '@mui/material/Slide';
import { useNavigate } from 'react-router-dom';

const Transition = React.forwardRef<HTMLDivElement, SlideProps>(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface LoginPromptDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginPromptDialog({ open, onClose }: LoginPromptDialogProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose(); // must update parent state
    navigate('/login');
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose} // ensures Escape key & backdrop click work
    >
      <DialogTitle>Login Required</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You must be logged in to view item details. Please login to continue.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            console.log('Cancel clicked'); // debug
            onClose(); // this must call parent to close
          }}
          color="inherit"
        >
          Cancel
        </Button>
        <Button onClick={handleLogin} variant="contained" color="primary">
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
}
