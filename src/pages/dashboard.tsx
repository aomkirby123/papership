/* React */
import React, { Component, Fragment } from "react"
import { store, Dexie } from "../react-component/Frequent"

/* Material UI */
import { 
    Button,
    MenuItem,
    TextField,
    Select,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    OutlinedInput,
    Fab,
    IconButton,
    ListItem
} from "@material-ui/core"

/* Component */
import Card from "../react-component/dashboard-card" /* webpackChunkName: "settings" */
import Appbar from "../react-component/appbar" /* webpackChunkName: "appbar" */

/* Local */
import "../css/dashboard.css"

interface collectionProps {
    name: string,
    id: number,
    function:any
}

class CollectionList extends Component<collectionProps, {}>{
    render(){
        return(
            <ListItem
                className="collection-list"
                divider
                button
            >
                <p>
                    <i className="material-icons">view_week</i>
                    {this.props.name}
                </p>
                <Button style={{color:"var(--danger)"}} onClick={() => this.props.function(this.props.id)}>
                    Delete
                </Button>
            </ListItem>
        )
    }
}

interface state {
    dialog: boolean,
    selector: boolean,
    selectorValue: string,
    color: string,
    title: string,
    collection: any,
    collectionType: string,
    typeSelector: boolean,
    blur: number,
    manageCollection: boolean,
    collectionData: any
}

export default class extends Component<{}, state> {
    constructor(props: any) {
        super(props);
        this.state = {
            dialog: false,
            selector: false,
            selectorValue: "",
            color: "",
            title: "",
            collection: [],
            collectionType: "",
            typeSelector: false,
            blur: 0,
            manageCollection: false,
            collectionData: []
        }
    }

    componentWillMount():void {
        this.loadCollection();
    }

    componentDidMount(){
        store.subscribe(() => {
            let state:any = store.getState(),
                blur:number = 0;
            if(state.drawer) blur = 5;
            if(state.blur) blur = state.blur;
            this.setState({
                blur: blur
            })
        })
    }

    componentWillUpdate(nextProps:any, nextState:any): void {
        if(nextState.selectorValue === this.state.selectorValue) return;
        switch(nextState.selectorValue){
            case "red":
                this.setState({
                    color: "#e03a3e"
                })
                break;
            case "green":
                this.setState({
                    color: "#61bb46"
                })
                break;
            case "blue":
                this.setState({
                    color: "#007aff"
                })
                break;
            case "pink":
                this.setState({
                    color: "#ff2d55"
                })
                break;
            case "violet":
                this.setState({
                    color: "#963d97"
                })
                break;
            default:
                break;
        }
    }

    dialog = (bool:boolean): void => {
        this.setState({
            dialog: bool
        })
        if(bool){
            store.dispatch({
                type: "blur",
                blur: 5
            })
        } else {
            store.dispatch({
                type: "blur",
                blur: 0
            })
        }
    }
    
    toggleSelector = (bool: boolean) => {
        this.setState({
            selector: bool
        })
    }

    toggleTypeSelector = (bool: boolean) => {
        this.setState({
            typeSelector: bool
        })
    }

    selectorChange = (event:any): void => {
        this.setState({ selectorValue: event.target.value });
    }

    typeSelectorChange = (event:any): void => {
        this.setState({ collectionType: event.target.value })
    }

    handleTitle = (event:any): void => {
        this.setState({
            title: event.target.value
        })
    }

    newCollection = async (e:any) => {
        e.preventDefault();
        if(this.state.selectorValue === "" || this.state.selectorValue === "" || this.state.collectionType === "") return;

        const collection = new Dexie("collection");
        collection.version(1).stores({
            category: "++id, name, color, type"
        })

        let tableCount:number = await collection.table("category").where({name: this.state.title}).count();

        if(tableCount !== 0) return;

        await collection.table("category").put({
            name: this.state.title,
            color: this.state.selectorValue,
            type: this.state.collectionType
        })

        this.setState({
            selector:false,
            dialog: false,
            selectorValue: "",
            title: "",
            color: "",
            collectionType: ""
        })

        store.dispatch({
            type: "blur",
            blur: 0
        });

        this.loadCollection();
    }

    loadCollection = async () => {
        const collection = new Dexie("collection"),
            document = new Dexie("document");

        collection.version(1).stores({
            category: "++id, name, color, type",
        });
        
        await collection.table("category").orderBy("id").toArray(data => {
            this.setState({
                collection: data
            })
        });

        document.version(1).stores({
            todo: "++id, objective, check, category"
        });

        this.setState({
            collectionData: []
        });

        await this.state.collection.map(async(data:any, index:number) => {
            await document.table("todo").where({"category": data.name}).toArray(arr => {
                let iter:number = 0;
                arr.map((data, index) => {
                    if(data.check === true) return ++iter
                    return iter
                })
                this.setState(prevState => ({
                    collectionData: [...prevState.collectionData, {
                        min: iter,
                        max: arr.length
                    }]
                }))
            });
        })

    }

    viewCollection = (bool:boolean) => {
        this.setState({
            manageCollection: bool
        })
    }

    collectionDelete = async (id:number) => {
        const collection = new Dexie("collection"),
            document = new Dexie("document");

        collection.version(1).stores({
            category: "++id, name, color, type"
        });

        document.version(1).stores({
            todo: "++id, objective, check, category"
        });

        let collectionName:string = "";
        await collection.table("category").where({"id": id}).toArray(data => {
            return collectionName = `${data[0].name}`;
        })

        await collection.table("category").where({"id": id}).delete();

        await document.table("todo").where({"category": collectionName}).delete();

        collection.table("category").orderBy("id").toArray(data => {
            this.setState({
                collection: data
            })
        })
    }

    render(){
        return(
            <Fragment>
                <Appbar icon="more_vert" blur={this.state.blur} function={() => this.viewCollection(true)} />
                <Fab 
                    id="fab" 
                    color="primary" 
                    onClick={() => this.dialog(true)}
                    style={{filter: `blur(${this.state.blur}px)`}}
                >
                    <span className="material-icons" style={{color: "white"}}>create</span>
                </Fab>
                <div id="main" style={{filter: `blur(${this.state.blur}px)`}}>
                    <div id="dashboard-slider">
                        { this.state.collection.map((data: any, index:number) => 
                            <Fragment key={index}>
                                {this.state.collectionData[index] !== undefined ?
                                    <Card 
                                        title={data.name} 
                                        color={data.color} 
                                        current={this.state.collectionData[index].min}
                                        max={this.state.collectionData[index].max}
                                        key={index} 
                                    />
                                : 
                                    <Card 
                                        title={data.name} 
                                        color={data.color} 
                                        current={0} 
                                        max={0} 
                                        key={index} 
                                    />
                                }
                            </Fragment>
                        ) }
                        { (this.state.collection[0] === undefined) ? 
                            <Fragment>
                                <Card color="red" title="New category" current={1} max={1} guide={true} onClick={() => this.dialog(true)} />
                            </Fragment> : 
                            <Fragment></Fragment> }
                        <div id="dashboard-end"></div>
                    </div>
                </div>
                <Dialog id="dashboard-dialog" open={this.state.dialog} aria-labelledby="Add new category">
                    <form action="" method="POST" onSubmit={e => this.newCollection(e)}>
                        <DialogTitle id="form-dialog-title">New Category</DialogTitle>
                        <DialogContent>
                            <TextField
                                margin="normal"
                                label="Category Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                onChange={(e:any) => this.handleTitle(e)}
                                value={this.state.title}
                                style={{marginTop:"20px",marginBottom:"0px"}}
                            />
                            <FormControl style={{width: "100%"}} variant="outlined">
                                <InputLabel htmlFor="Color selection" style={{marginTop:"14px"}}>Color</InputLabel>
                                <Select
                                    style={{marginTop: "15px", color: this.state.color }}

                                    open={this.state.selector}
                                    onOpen={() => this.toggleSelector(true)}
                                    onClose={() => this.toggleSelector(false)}

                                    value={this.state.selectorValue}
                                    onChange={(e:any) => this.selectorChange(e)}
                                    fullWidth
                                    required

                                    input={
                                        <OutlinedInput
                                            labelWidth={40}
                                            name="age"
                                        />
                                    }

                                    inputProps={{
                                        name: "color"
                                    }}
                                >
                                    <MenuItem value="red" style={{color: "#e03a3e", fontWeight:"bold"}}>
                                        Red
                                    </MenuItem>
                                    <MenuItem value="green" style={{color: "#61bb46", fontWeight:"bold"}}>
                                        Green
                                    </MenuItem>
                                    <MenuItem value="blue" style={{color: "#007aff", fontWeight:"bold"}}>
                                        Blue
                                    </MenuItem>
                                    <MenuItem value="pink" style={{color: "#ff2d55", fontWeight:"bold"}}>
                                        Pink
                                    </MenuItem>
                                    <MenuItem value="violet" style={{color: "#963d97", fontWeight:"bold"}}>
                                        Violet
                                    </MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl style={{width: "100%"}} variant="outlined">
                                <InputLabel htmlFor="Type" style={{marginTop:"14px"}}>Type</InputLabel>
                                <Select
                                    style={{marginTop: "15px" }}

                                    open={this.state.typeSelector}
                                    onOpen={() => this.toggleTypeSelector(true)}
                                    onClose={() => this.toggleTypeSelector(false)}

                                    value={this.state.collectionType}
                                    onChange={(e:any) => this.typeSelectorChange(e)}
                                    fullWidth
                                    required

                                    input={
                                        <OutlinedInput
                                            labelWidth={35}
                                            name="age"
                                        />
                                    }

                                    inputProps={{
                                        name: "collectionType"
                                    }}
                                >
                                    <MenuItem value="Time-based" disabled>
                                        Time-based
                                    </MenuItem>
                                    <MenuItem value="Todo Lists">
                                        Todo lists
                                    </MenuItem>
                                    <MenuItem value="Schedule" disabled>
                                        Schedule
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button color="primary" onClick={() => this.dialog(false)}>
                                Cancel
                            </Button>
                            <Button color="primary" type="submit">
                                New category
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
                {this.state.manageCollection ?
                <div id="manage-collection-dialog">
                    <div id="manage-appbar">
                        <div>
                            <IconButton onClick={() => this.viewCollection(false)}>
                                <i className="material-icons">close</i>
                            </IconButton>
                        </div>
                        <div>
                            <p>
                                Manage Collection
                            </p>
                        </div>
                        <div>
                        </div>
                    </div>
                    <div id="manage-list">
                        {this.state.collection.map((data:any, index:number) =>
                            <CollectionList 
                                key={index}
                                name={data.name}
                                id={data.id}
                                function={() => this.collectionDelete(data.id)}
                            />
                        )}
                    </div>
                </div>
                : null }
            </Fragment>
        )
    }
}