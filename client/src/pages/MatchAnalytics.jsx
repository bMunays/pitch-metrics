// ==========================================
// MATCH ANALYTICS (client/src/pages/MatchAnalytics.jsx)
// ==========================================
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, AlertCircle } from 'lucide-react';
import axios from 'axios';

const MatchAnalytics = () => {
  const { id: matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`/api/matches/${matchId}`);
        setMatch(response.data.match);
      } catch (err) {
        console.error("Failed to load match analytics", err);
        setError("Could not load match data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [matchId]);

  // ==========================================
  // DATA AGGREGATION ENGINE
  // ==========================================
  // This function takes all events in the match, isolates a specific team, 
  // and counts up the goals, yellows, and reds for each player on that team.
  const calculateTeamStats = (teamId) => {
    if (!match) return { score: 0, playerStats: [] };

    let teamScore = 0;
    const statsMap = {}; // A temporary object to group stats by Player ID

    match.events.forEach(event => {
      // 1. Calculate the overall score
      if (event.eventType === 'GOAL') {
        // We check if the player who scored belongs to this specific team.
        // (Assuming primaryPlayer has a teamId attached, or we infer from event context)
        // For absolute precision based on our schema, we check the player's teamId.
        if (event.primaryPlayer && event.primaryPlayer.teamId === teamId) {
          teamScore += 1;
        }
      }

      // 2. Aggregate individual player stats
      if (event.primaryPlayer && event.primaryPlayer.teamId === teamId) {
        const playerId = event.primaryPlayer.id;
        
        // If this player isn't in our map yet, add them with 0s
        if (!statsMap[playerId]) {
          statsMap[playerId] = {
            name: `${event.primaryPlayer.firstName} ${event.primaryPlayer.lastName}`,
            goals: 0,
            yellowCards: 0,
            redCards: 0
          };
        }

        // Increment the correct stat
        if (event.eventType === 'GOAL') statsMap[playerId].goals += 1;
        if (event.eventType === 'YELLOW_CARD') statsMap[playerId].yellowCards += 1;
        if (event.eventType === 'RED_CARD') statsMap[playerId].redCards += 1;
      }
    });

    // Convert the statsMap object back into a clean array for our table to render
    const playerStatsArray = Object.values(statsMap);

    return { score: teamScore, playerStats: playerStatsArray };
  };

  // ==========================================
  // USER INTERFACE
  // ==========================================
  if (isLoading) return <Container className="py-5 text-center"><Spinner animation="border" variant="success" /></Container>;
  if (error || !match) return <Container className="py-5 text-center text-danger">{error}</Container>;

  const homeStats = calculateTeamStats(match.homeTeamId);
  const awayStats = calculateTeamStats(match.awayTeamId);

  return (
    <Container className="py-5">
      <Button as={Link} to="/dashboard" variant="link" className="text-decoration-none mb-3 px-0 text-muted">
        <ArrowLeft size={18} className="me-2" /> Back to Dashboard
      </Button>

      {/* HEADER: THE FINAL SCORE */}
      <Card className="shadow-sm border-0 mb-5 text-center bg-dark text-white">
        <Card.Body className="py-5">
          <Badge bg="success" className="mb-3 px-3 py-2">{match.tournamentName}</Badge>
          <Row className="align-items-center justify-content-center">
            <Col xs={4}>
              <h2 className="fw-bold">{match.homeTeam.name}</h2>
            </Col>
            <Col xs={4}>
              <div className="display-1 fw-bold text-success">
                {homeStats.score} - {awayStats.score}
              </div>
              <p className="text-muted mb-0">Full Time Analytics</p>
            </Col>
            <Col xs={4}>
              <h2 className="fw-bold">{match.awayTeam.name}</h2>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {/* HOME TEAM STATS TABLE */}
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
              <h4 className="fw-bold"><Trophy size={20} className="me-2 text-warning"/> {match.homeTeam.name}</h4>
            </Card.Header>
            <Card.Body>
              {homeStats.playerStats.length > 0 ? (
                <Table striped hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Player</th>
                      <th className="text-center">Goals</th>
                      <th className="text-center">Yellows</th>
                      <th className="text-center">Reds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeStats.playerStats.map((stat, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold">{stat.name}</td>
                        <td className="text-center">{stat.goals > 0 ? <Badge bg="success">{stat.goals}</Badge> : '-'}</td>
                        <td className="text-center">{stat.yellowCards > 0 ? <Badge bg="warning" text="dark">{stat.yellowCards}</Badge> : '-'}</td>
                        <td className="text-center">{stat.redCards > 0 ? <Badge bg="danger">{stat.redCards}</Badge> : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No specific player events logged for this team.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* AWAY TEAM STATS TABLE */}
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
              <h4 className="fw-bold"><AlertCircle size={20} className="me-2 text-secondary"/> {match.awayTeam.name}</h4>
            </Card.Header>
            <Card.Body>
              {awayStats.playerStats.length > 0 ? (
                <Table striped hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Player</th>
                      <th className="text-center">Goals</th>
                      <th className="text-center">Yellows</th>
                      <th className="text-center">Reds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {awayStats.playerStats.map((stat, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold">{stat.name}</td>
                        <td className="text-center">{stat.goals > 0 ? <Badge bg="success">{stat.goals}</Badge> : '-'}</td>
                        <td className="text-center">{stat.yellowCards > 0 ? <Badge bg="warning" text="dark">{stat.yellowCards}</Badge> : '-'}</td>
                        <td className="text-center">{stat.redCards > 0 ? <Badge bg="danger">{stat.redCards}</Badge> : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No specific player events logged for this team.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MatchAnalytics;