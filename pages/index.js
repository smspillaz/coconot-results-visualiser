import React from 'react';
import Layout from '../Layout'
import { Table } from 'reactstrap'

class IndexPage extends React.Component {
    constructor() {
        super()
        this.state = {
            data: []
        };
    }

    componentDidMount() {
        console.log("Component did mount");
        fetch('/table').then(d => d.json()).then(json => this.setState({
            data: json
        }))
    }

    render() {
        return (
            <div>
                <Layout>
                    <h1>Coconot - Detected Road Signs</h1>
                    <Table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Video File</th>
                                <th>Road Name</th>
                                <th>Date</th>
                                <th>Distance</th>
                                <th>Detected Object</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.data.map(row => (
                                 <tr>
                                    <th scope="row">1</th>
                                    <td>{row.video}</td>
                                    <td>{row.name}</td>
                                    <td>{row.date}</td>
                                    <td>{row.dist}</td>
                                    <td>{row.detected}</td>
                                    <td>{row.probability}</td>
                                 </tr>
                             ))}
                        </tbody>
                    </Table>
                </Layout>
            </div>
        )
    }
}

export default IndexPage;
