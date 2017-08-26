import React from 'react';
import Layout from '../Layout'
import { Card, Collapse, Table } from 'reactstrap'

class Canvas extends React.Component {
    componentDidMount() {
        const ctx = this.refs.canvas.getContext('2d');
        this.props.render(ctx, this.props.width, this.props.height)
    }

    render() {
        return (
            <canvas
                ref="canvas"
                width={this.props.width}
                height={this.props.height}
            />
        )
    }
}

class Preview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null
        }
    }

    componentDidMount() {
        const image = new window.Image();
        image.src = this.props.image;
        image.onload = () => {
            this.setState({
                image: image
            })
        }
    }

    render() {
        if (!this.state.image) {
            return <div />
        }

        const aspect = this.state.image.naturalWidth / this.state.image.naturalHeight;
        const height = this.props.width / aspect;

        return (
            <Canvas
                width={this.props.width}
                height={height}
                render={(ctx, width, height) => {
                    ctx.drawImage(this.state.image, 0, 0)
                    ctx.strokeStyle = "#ff0000"
                    ctx.lineWidth = 3
                    ctx.strokeRect(this.props.box.x1,
                                   this.props.box.y1,
                                   this.props.box.x2 - this.props.box.x1,
                                   this.props.box.y2 - this.props.box.y1)
                }}
            />
        )
    }
}

class CollapsablePreview extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Collapse isOpen={this.props.open}>
                  {this.props.open ? this.props.children : <div />}
                </Collapse>
            </div>
        )
    }
}

class VideoDataTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeRow: -1
        }
    }

    handleRowClicked(rowIndex) {
        this.setState({
            activeRow: (this.state.activeRow === rowIndex) ? -1 : rowIndex
        })
    }

    render() {
        const activeRow = this.state.activeRow

        return (
            <div>
                <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Road Name</th>
                            <th>Date</th>
                            <th>Distance</th>
                            <th>Detected Sign</th>
                            <th>Probability</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.data.filter(row => row.probability > 0.70).map((row, i) => ([
                            () => (
                                <tr
                                  key={row.dist + ' ' + i}
                                  onClick={() => this.handleRowClicked(i)}>
                                    <th>{i}</th>
                                    <td>{row.name}</td>
                                    <td>{row.date}</td>
                                    <td>{row.dist}</td>
                                    <td>{row.detected}</td>
                                    <td>{`${Math.trunc(row.probability * 10000) / 100}%`}</td>
                                </tr>
                            ),
                            () => (
                                <tr>
                                    <td
                                      colSpan={"7"}
                                      style={{
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                        textAlign: 'center'
                                      }}
                                    >
                                        <CollapsablePreview open={activeRow === i}>
                                            <Preview
                                              image={row.img}
                                              box={{
                                                x1: row.x1,
                                                y1: row.y1,
                                                x2: row.x2,
                                                y2: row.y2
                                              }}
                                              width={960}
                                            />
                                        </CollapsablePreview>
                                    </td>
                                </tr>
                            )
                         ])).reduce((all, incoming) => all.concat(incoming), []).map(func =>
                           func()
                         )}
                    </tbody>
                </Table>
            </div>
        )
    }
}

class IndexPage extends React.Component {
    constructor() {
        super()
        this.state = {
            data: []
        };
    }

    componentDidMount() {
        fetch('/table').then(d => d.json()).then(json => this.setState({
            data: json
        }))
    }

    render() {
        return (
            <div>
                <Layout>
                    <div>
                        <img src='/web/coconut.jpg' style={{ display: 'inline' }}></img>
                        {' '}
                        <h1 style={{ marginTop: '0.5em', display: 'inline' }}>Coconot - Detected Road Signs</h1>
                    </div>
                    {this.state.data.map(videoMap => (
                        <div key={videoMap.directory} style={{ padding: '0.5em' }}>
                            <Card>
                                <h2 style={{ margin: '0.5em' }}>{videoMap.directory}</h2>
                                <VideoDataTable data={videoMap.values} />
                            </Card>
                        </div>
                     ))}
                </Layout>
            </div>
        )
    }
}

export default IndexPage;
