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
                                <th>Detected Sign</th>
                                <th>Probability</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.data.map((row, i) => (
                                 <tr key={row.dist + ' ' + i}>
                                    <th scope="row">{i}</th>
                                    <td>{row.video}</td>
                                    <td>{row.name}</td>
                                    <td>{row.date}</td>
                                    <td>{row.dist}</td>
                                    <td>{row.detected}</td>
                                    <td>{`${Math.trunc(row.probability * 10000) / 100}%`}</td>
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
