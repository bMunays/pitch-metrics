// ==========================================
// COACH DASHBOARD (client/src/pages/Dashboard.jsx)
// ==========================================
import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PlayCircle, Users, Activity, Calendar } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  // State for fetching past matches
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch match history when the Dashboard loads
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get('/api/matches');
        setMatches(response.data.matches);
      } catch (err) {
        console.error("Failed to load match history", err);
        setError("Could not load match history from server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Format the date to look nice (e.g., "Oct 25, 2025")
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Coach Dashboard</h2>
        <span className="text-muted">Welcome, {user?.email}</span>
      </div>

      {/* TOP SECTION: QUICK ACTIONS */}
      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0 text-center hover-card">
            <Card.Body className="p-5 d-flex flex-column align-items-center justify-content-center">
              <PlayCircle size={48} color="#4ade80" className="mb-3" />
              <Card.Title>Start Live Match</Card.Title>
              <Card.Text className="text-muted mb-4">
                Initialize a new match and open the touchline data capture dashboard.
              </Card.Text>
              <Button as={Link} to="/new-match" variant="success" className="w-100 mt-auto">
                Setup Match
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0 text-center">
            <Card.Body className="p-5 d-flex flex-column align-items-center justify-content-center">
              <Users size={48} color="#6c757d" className="mb-3" />
              <Card.Title>Manage Squads</Card.Title>
              <Card.Text className="text-muted mb-4">
                Add players, update profiles, and manage opponent team data.
              </Card.Text>
              <Button variant="outline-secondary" className="w-100 mt-auto" disabled>
                Coming Soon (V2.0)
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0 text-center">
            <Card.Body className="p-5 d-flex flex-column align-items-center justify-content-center">
              <Activity size={48} color="#6c757d" className="mb-3" />
              <Card.Title>Global Analytics</Card.Title>
              <Card.Text className="text-muted mb-4">
                Review historical match data and export reports.
              </Card.Text>
              <Button variant="outline-secondary" className="w-100 mt-auto" disabled>
                Coming Soon (V2.0)
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* BOTTOM SECTION: MATCH HISTORY (Admin Oversight) */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-3">
          <h4 className="fw-bold mb-0"><Calendar className="me-2" size={24} /> Match History</h4>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4"><Spinner animation="border" variant="success" /></div>
          ) : error ? (
            <div className="text-center py-4 text-danger">{error}</div>
          ) : matches.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No matches have been played yet.</p>
              <Button as={Link} to="/new-match" variant="outline-success">Start Your First Match</Button>
            </div>
          ) : (
            <Table hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Tournament</th>
                  <th>Matchup</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id}>
                    <td className="text-muted">{formatDate(match.matchDate)}</td>
                    <td><Badge bg="secondary" className="fw-normal">{match.tournamentName || 'Friendly'}</Badge></td>
                    <td className="fw-semibold">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </td>
                    <td className="text-end">
                      {/* Link to the Analytics page we built in the previous step! */}
                      <Button as={Link} to={`/analytics/${match.id}`} variant="outline-primary" size="sm">
                        View Analytics
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

    </Container>
  );
};

export default Dashboard;