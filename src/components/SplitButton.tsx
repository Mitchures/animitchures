import { useState, useRef, Fragment } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

import './SplitButton.css';

const OPTIONS = ['COMPLETED', 'CURRENT', 'DROPPED', 'PLANNING', 'PAUSED', 'REPEATING'];

export default function SplitButton({ value }: { value: string }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(OPTIONS.indexOf(value));

  const handleClick = () => {
    console.info(`You clicked ${OPTIONS[selectedIndex]}`);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  const handleText = (text: string) => {
    if (!text) text = 'Add to Watchlist';
    else if (text === 'PLANNING') text = 'Plan to Watch';
    else if (text === 'CURRENT') text = 'Watching';
    else if (text === 'REPEATING') text = 'Rewatching';
    else text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    return text;
  };

  return (
    <Fragment>
      <ButtonGroup
        className="splitButton"
        variant="contained"
        ref={anchorRef}
        aria-label="split button"
      >
        <Button onClick={handleClick}>{handleText(OPTIONS[selectedIndex])}</Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {OPTIONS.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {handleText(option)}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Fragment>
  );
}
