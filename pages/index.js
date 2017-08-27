import React from 'react';
import Layout from '../Layout'
import { Badge, Card, Col, Collapse, Container, ListGroup, ListGroupItem, Row, Table } from 'reactstrap'

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
        const scale =  this.props.width / this.state.image.naturalWidth;

        return (
            <div>
                <Row style={{ padding: 12 }}>
                    <Col xs="12" md="5">
                        <Canvas
                            width={this.props.width}
                            height={height}
                            render={(ctx, width, height) => {
                                ctx.scale(scale, scale)
                                ctx.drawImage(this.state.image, 0, 0)
                                ctx.strokeStyle = "#ff0000"
                                ctx.lineWidth = 3
                                this.props.detections.forEach(detection =>
                                    ctx.strokeRect(detection.x1,
                                                   detection.y1,
                                                   detection.x2 - detection.x1,
                                                   detection.y2 - detection.y1)
                                )
                                
                            }}
                        />
                    </Col>
                    <Col xs="12" md={{ offset: 1, size: 6 }}>
                        <div>
                            <ListGroup>
                                {this.props.detections.map(detection => (
                                    <ListGroupItem
                                      className="justify-content-between"
                                      key={detection.probability}
                                    >
                                      {detection.detected} <Badge pill>{Math.trunc(detection.probability * 10000) / 100}%</Badge>
                                    </ListGroupItem>
                                 ))}
                            </ListGroup>
                        </div>
                    </Col>
                </Row>
            </div>
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
            activeRows: []
        }
    }

    handleRowClicked(rowIndex) {
        if (this.state.activeRows.indexOf(rowIndex) === -1) {
            this.setState({
                activeRows: [...this.state.activeRows, rowIndex]
            })
        } else {
            this.setState({
                activeRows: this.state.activeRows.filter(i => i !== rowIndex)
            })
        }
    }

    render() {
        const activeRows = new Set(this.state.activeRows)

        return (
            <div>
                <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Road Name</th>
                            <th>Date</th>
                            <th>Distance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.data.filter(row =>
                            row.detections.filter(d => d.probability > 0.70).length > 0
                         ).map((row, i) => ([
                            () => (
                                <tr
                                  key={row.dist + ' ' + i}
                                  onClick={() => this.handleRowClicked(i)}>
                                    <th>{i}</th>
                                    <td>{row.name}</td>
                                    <td>{row.date}</td>
                                    <td>{row.dist}</td>
                                </tr>
                            ),
                            () => (
                                <tr>
                                    <td
                                      colSpan={"4"}
                                      style={{
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                        paddingLeft: 0,
                                        paddingRight: 0,
                                        textAlign: 'center'
                                      }}
                                    >
                                        <CollapsablePreview open={activeRows.has(i)}>
                                            <Preview
                                              image={row.img}
                                              detections={row.detections.filter(d => d.probability > 0.70)}
                                              width={480}
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

function mapToKeysAndValues(object) {
    return Object.keys(object).map(key => ({ key, value: object[key] }))
}

const VideoCard = ({ videoMap }) => (
    <div key={videoMap.directory} style={{ padding: '0.5em' }}>
        <Card>
            <h2 style={{ margin: '0.5em' }}>{videoMap.directory}</h2>
            <Row style={{ padding: 12 }}>
                <Col md="12">
                    <h3>{'Overall Statistics'}</h3>
                </Col>
                <Col md="12">
                    <ListGroup>
                        {mapToKeysAndValues(videoMap.values.reduce((counts, incoming) => {
                            incoming.detections.forEach((detection) => {
                                const { detected } = detection
                                if (!counts[detected]) {
                                    counts[detected] = 1;
                                } else {
                                    counts[detected]++
                                }
                            })
                            return counts
                        }, {})).map(({ key, value}) => (
                            <ListGroupItem
                              className="justify-content-between"
                              key={key}
                            >
                              {key} <Badge pill>{value}</Badge>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </Col>
            </Row>
            <VideoDataTable data={videoMap.values} />
        </Card>
    </div>
)

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
                        <VideoCard videoMap={videoMap}/>
                     ))}
                </Layout>
            </div>
        )
    }
}

export default IndexPage;
