import React, { useEffect, useState } from 'react';
import Amplify, { Auth, Analytics, API, graphqlOperation } from 'aws-amplify';
import { listDcv, createDcv, brokerActions } from './graphql/queries';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
// beautify everything - based on MaterialUI
import 'fontsource-roboto';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import { Menu, Typography } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
//End beautification

//Amplify.Logger.LOG_LEVEL='INFO'

// 
// ADD A TURN ON/OFF BUTTON FOR THE MAINTENANCE WINDOW
// 

//MaterialUI configuration
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex',
    padding: '8px',
    height: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: '25%',
    height: '100%'
  },
  selectEmpty: {
    marginTop: theme.spacing(1),
  },
  menuButton: { 
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  dataGrid: {

  },
  container: { 
    maxHeight: 440,
  },
}));
//End Material UI

//Table config
const columns = [
  { id: 'instanceId', label: 'Instance ID', minWidth: '15%' },
  { id: 'instanceName', label: 'Instance Name', minWidth: '15%' },
  { id: 'state', label: 'State', minWidth: '10%' },
  { id: 'publicIp', label: 'Instance IP', minWidth: '15%', align: 'center' },
  { id: 'instanceType', label: 'Instance Type', minWidth: '25%' },
  { id: 'keyName', label: 'Key Pair Name', minWidth: '35%' },
];
//End table config
const initialState = { launchTemplateId: '', keyName: '', instanceType: '', instanceName: '' }
const brokerState = { sessionId: 'paragao', owner: 'Administrator', sessionType: 'CONSOLE', concurrency: '', glenabled: 'yes', tags: ''}
const App = () => {
  const [brokerParams, setBrokerParams] = useState(brokerState)
  const [formState, setFormState] = useState(initialState)
  const [instances, setInstances] = useState([])
  const [instance, setInstance] = useState([])
  const [keys, setKeys] = useState([])
  const [templates, setTemplates] = useState([])
  const dcvInstanceTypes = [ 
    { type: 'g3.4xlarge', config: '4 vCPU, 30GB RAM'},
    { type: 'g3.8xlarge', config: '16 vCPU, 122GB RAM'},
    { type: 'g3.16xlarge', config: '32 vCPU, 244GB RAM'},
    { type: 'g3s.xlarge', config: '64 vCPU, 488GB RAM'},
    { type: 'g4dn.xlarge', config: '4 vCPU, 16GB RAM'},
    { type: 'g4dn.2xlarge', config: '8 vCPU, 32GB RAM'},
    { type: 'g4dn.4xlarge', config: '16 vCPU, 64GB RAM'},
    { type: 'g4dn.8xlarge', config: '32 vCPU, 128GB RAM'},
    { type: 'g4dn.12xlarge', config: '48 vCPU, 192GB RAM'},
    { type: 'g4dn.16xlarge', config: '64 vCPU, 256GB RAM'},
    { type: 'p3.2xlarge', config: '8 vCPU, 61GB RAM'},
    { type: 'p3.8xlarge', config: '32 vCPU, 244GB RAM'},
    { type: 'p3.16xlarge', config: '64 vCPU, 488GB RAM'},
    { type: 'p3dn.24xlarge', config: '96 vCPU, 768GB RAM' },
  ]
  //Material UI
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [openSnack, setOpenSnack] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl); 
  const [snackMessage, setSnackMessage] = useState();
  const [snackSeverity, setSnackSeverity] = useState();
  const [switchState, setSwitchState] = useState({maintenanceWindow: true})
  //End Material UI

  useEffect(() => {
    updateEndpoint();
  }, [])

  useEffect(() => {
    fetchLaunchTemplates();
  }, [])

  useEffect(() => {
    fetchInstances();
  }, [])

  //Material UI
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchChange= (event) => {
    setSwitchState({ ...switchState, [event.target.name]: event.target.checked});

    // set workflow to enable/disable the maintenance window in AWS SSM

  }

  const CustomSwitch = withStyles({
    switchBase: {
      color: green[300],
      '&$checked': {
        color: green[500],
      },
      '&$checked + $track': {
        backgroundColor: green[500],
      },
    },
    checked: {},
    track: {},
  })(Switch);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnack(false);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  function buildRows(instances) {
    try {
      const rows = []

      instances.map((instance) => {
        var tagName = ''
        instance.Name.map((name) => {
          if (name["Key"] === 'Name') {
            tagName = name["Value"]
            return tagName
          } else {
            return ''
          }
        })
        rows.push({ instanceId: instance.InstanceId, instanceName: tagName, state: instance.State, publicIp: instance.PublicIp, instanceType: instance.InstanceType, keyName: instance.KeyName  })
        return rows
      })
  
      setRows(rows)
  
      return rows;
      
    } catch (err) {
      console.log('Could not update rows: ', rows, err)
    }
  }

  //End Material UI

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function updateEndpoint() {
    try {
      const r = await Auth.currentUserInfo()

      const userId = r.attributes.sub 
      const phone = r.attributes.phone_number
      const email = r.attributes.email 
      const username = r.username 

      Analytics.updateEndpoint({
        attributes: {
          username: [username],
          phone: [phone],
          email: [email]
        },
        metrics: {},
        userId: userId,
        userAttributes: {}
      }).then(() => {
        console.log('updated endpoint')
      });
    } catch (err) {
      console.log('could not update the endpoint: ', err)
    }
  }
  
  async function fetchLaunchTemplates() {
    try {
      const launchTemplates = await API.graphql(graphqlOperation(createDcv, {tag: 'DCV', action: 'list'} ))
      const templates = launchTemplates.data.createDcv
      setTemplates(JSON.parse(templates))
      console.log('fetched Launch Templates')

    } catch (err) { console.log('error fetching templates: ', err) }
  }

  async function fetchInstances() {
    try {
      const dcvinstances = await API.graphql(graphqlOperation(listDcv, {tag: 'DCV'}))
      const x = JSON.parse(dcvinstances.data.listDcv)
      const instances = x[0]
      const keys = x[1]

      setInstances(instances)
      setKeys(keys)
      buildRows(instances)
      
      //console.log(instances)
      Analytics.record({
        name: 'instancesLoaded',
        attributes: {},
        metrics: { numberOfInstances: instances.length }
      });

      console.log('fetched instance list')
    } catch (err) { console.log('error fetching instances: ', err) }
  }

  async function createInstance() {
    try {
      if (!formState.launchTemplateId) return
      const instance = { ...formState }
      setInstance([ ...instances, instance])
      setFormState(initialState)

      const tag = 'DCV'
      const params = { 
        tag: tag,
        id: instance.launchTemplateId,
        keyName: instance.keyName,
        instanceType: instance.instanceType,
        instanceName: instance.instanceName,
        action: 'create'
      }

      const temp = await API.graphql(graphqlOperation(createDcv, params))
      setSnackMessage('Instance created sucessfully.');
      setSnackSeverity('success');
      setOpenSnack(true); //open the snackbar alert

      // fetch new list of instances if creation completes
      fetchInstances()

      Analytics.record({
        name: 'instancesAdded'
      });
      console.log('instance created')

    } catch (err) { 
      setSnackMessage('Instance creation failed.');
      setSnackSeverity('error');
      setOpenSnack(true);

      console.log('error creating the instance:', err)
    }
  }

  async function describeSessions(e) {

    const param = { ...brokerParams }
    const params = {
      action: 'list',
      sessionId: param.sessionId,
      owner: param.owner,
      sessionType: param.sessionType,
      concurrency: param.concurreny,
      glenabled: param.glenabled,
      tags: param.sessionTags
    }
    const response = await API.graphql(graphqlOperation(brokerActions, params))
    console.log(response)
  }

  return (
    <div className={classes.root}>
      <Grid container justify="space-between" spacing={2}>
        <Grid item xs={12}>
            <AppBar position="static">
              <Toolbar>
                <IconButton 
                  edge="start" 
                  color="inherit" 
                  aria-label="menu"
                  className={classes.menuButton}
                  onClick={handleMenu}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>Instances</MenuItem>
                  <MenuItem onClick={handleClose}>User Profile</MenuItem>
                </Menu>
                <Typography variant="h6" className={classes.title}>
                  AWS Managed DCV Solution
                </Typography>
                <FormControlLabel
                  control={<CustomSwitch checked={switchState.maintenanceWindow} onChange={handleSwitchChange} name="maintenanceWindow" />}
                  label="Maintenance Window"
                  color="default"
                />
                <Button color="inherit" onClick={describeSessions}>DescribeSessions</Button>
                <Button color="inherit"><AmplifySignOut /></Button>
              </Toolbar>
            </AppBar>
          </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <FormControl variant="outlined" className={classes.formControl} required>
              <InputLabel id="template">EC2 Launch Template: </InputLabel>
              <Select 
                labelId="template"
                id="templateId"
                value={formState.launchTemplateId}
                onChange={event => setInput('launchTemplateId', event.target.value)}
                label="Template"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {
                  templates.map((template, index) => (
                    <MenuItem value={template.id}>{template.name}</MenuItem>
                  ))
                }
              </Select>
              <FormHelperText>Required</FormHelperText>
            </FormControl>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="pairName">Key Pair Name (PEM): </InputLabel>
              <Select 
                labelId="pairName"
                id="keyPair"
                value={formState.keyName}
                onChange={event => setInput('keyName', event.target.value)}
                label="Key Pair"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {
                  keys.map((key, index) => (
                    <MenuItem value={key.keyName}>{key.keyName}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="instanceType">Instance Type: </InputLabel>
              <Select 
                labelId="instanceType"
                id="instanceType"
                value={formState.instanceType}
                onChange={event => setInput('instanceType', event.target.value)}
                label="EC2 Type"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {
                  dcvInstanceTypes.map((instance, index) => (
                    <MenuItem value={instance.type}>{instance.type}  (<i>{instance.config}</i>)</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <FormControl variant="outlined" className={classes.formControl}>
              <TextField 
                id="instanceName"
                label="Instance Name"
                variant="outlined"
                helperText="Name to show on AWS console"
                value={formState.instanceName}
                onChange={event => setInput('instanceName', event.target.value)} 
              />
            </FormControl>
            <br />
            <Button variant="contained" color="primary" onClick={createInstance}>Create a new DCV instance</Button>
            <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleSnackbarClose}>
              <Alert onClose={handleSnackbarClose} severity={snackSeverity}>
                {snackMessage}
              </Alert>
            </Snackbar>
          </Paper>
        </Grid>
        <Grid item xs={12} className={classes.dataGrid}>
          <Paper className={classes.paper}>
            <TableContainer className={classes.container}>
              <Table stickyHeader aria-label="List of DCV Instances">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ mindWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row.index}>
                        {columns.map((column) => {
                          const value = row.[column.id];
                          const publicIp = row.publicIp

                          if (publicIp) { 
                            const ip = `https://${publicIp}:8443`
                            
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.id === 'publicIp' ? <a href={ip} target="_blank" rel="noopener noreferrer">{ip}</a> : value}
                              </TableCell>
                            )
                          } else { 
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {value}
                              </TableCell>
                            )
                          }
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>   
      </Grid>
    </div>
  )
}

export default withAuthenticator(App);
