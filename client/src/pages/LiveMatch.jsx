// ==========================================
// TOUCHLINE DASHBOARD (client/src/pages/LiveMatch.jsx)
// ==========================================
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Modal, Form, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Square, AlertTriangle, Goal, Activity } from 'lucide-react';
import axios from 'axios';

const LiveMatch = () => {
  const { id: matchId } = useParams(); // Grabs the Match ID from the URL
  const navigate = useNavigate();

  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [match, setMatch] = useState(null);
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Modal (Pop-up) State for rapid logging
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // e.g., 'GOAL_HOME', 'YELLOW_CARD'
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // 2. DATA FETCHING (On Page Load)
  // ==========================================
  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        // 1. Get the Match and Teams
        const matchRes = await axios.get(`/api/matches/${matchId}`);
        const matchData = matchRes.data.match;
        setMatch(matchData);

        // 2. Fetch players for BOTH teams so they are ready for the dropdowns
        const homeRes = await axios.get(`/api/players/team/${matchData.homeTeamId}`);
        const awayRes = await axios.get(`/api/players/team/${matchData.awayTeamId}`);
        
        setHomePlayers(homeRes.data.players);
        setAwayPlayers(awayRes.data.players);

      } catch (err) {
        console.error("Failed to load match data", err);
        alert("Error loading match data. Please return to dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchData();
  }, [matchId]);

  // ==========================================
  // 3. THE TIMER ENGINE
  // ==========================================
  useEffect(() => {
    let interval = null;
    
    if (timerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => {
          const newSeconds = prev + 1;
          
          // ALERTS: Trigger at exactly 45 mins (2700s) and 90 mins (5400s)
          if (newSeconds === 2700 || newSeconds === 5400) {
            // Haptic Feedback for Android devices (vibrates for 500ms, pauses 200ms, vibrates 500ms)
            if ("vibrate" in navigator) {
              navigator.vibrate([500, 200, 500]);
            }
            // Visual/Audio fallback could go here
            alert(`Time alert! Minute: ${Math.floor(newSeconds / 60)}`);
          }
          return newSeconds;
        });
      }, 1000); // 1000 milliseconds = 1 second
    } else {
      clearInterval(interval);
    }
    
    // Cleanup function when component unmounts
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Math helpers to format the timer nicely (e.g., 45:00)
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentGameMinute = Math.floor(secondsElapsed / 60);

  // ==========================================
  // 4. EVENT LOGGING HANDLERS
  // ==========================================
  const openActionModal = (type) => {
    setActionType(type);
    setSelectedPlayer('');
    setEventNotes('');
    setShowModal(true);
  };

  const handleSaveEvent = async () => {
    setIsSubmitting(true);
    
    try {
      // Determine what to save based on the button clicked
      let apiEventType = 'OTHER';
      if (actionType.includes('GOAL')) apiEventType = 'GOAL';
      if (actionType.includes('YELLOW')) apiEventType = 'YELLOW_CARD';
      if (actionType.includes('RED')) apiEventType = 'RED_CARD';
      if (actionType === 'INJURY') apiEventType = 'INJURY';

      await axios.post(`/api/matches/${matchId}/events`, {
        eventType: apiEventType,
        gameMinute: currentGameMinute,
        primaryPlayerId: selectedPlayer || null,
        notes: eventNotes
      });

      // Close modal and reset
      setShowModal(false);
      // Optional haptic confirmation that data was saved
      if ("vibrate" in navigator) navigator.vibrate(50); 
      
    } catch (err) {
      console.error("Failed to save event", err);
      alert("Failed to log event. Check network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which list of players to show in the dropdown based on context
  const getRelevantPlayers = () => {
    if (actionType === 'GOAL_HOME' || actionType === 'YELLOW_HOME' || actionType === 'RED_HOME') {
      return homePlayers;
    }
    if (actionType === 'GOAL_AWAY' || actionType === 'YELLOW_AWAY' || actionType === 'RED_AWAY') {
      return awayPlayers;
    }
    return [...homePlayers, ...awayPlayers]; // Default: show all if context is unknown
  };


  // ==========================================
  // 5. USER INTERFACE
  // ==========================================
  if (isLoading) return <Container className="py-5 text-center"><Spinner animation="grow" variant="success" /></Container>;
  if (!match) return <Container className="py-5 text-center">Match not found.</Container>;

  return (
    <Container fluid className="py-3 bg-light min-vh-100">
      
      {/* SECTION 1: THE SCOREBOARD & TIMER */}
      <Card className="shadow-sm border-0 mb-4 bg-dark text-white text-center">
        <Card.Body className="py-4">
          <Row className="align-items-center">
            <Col xs={4}>
              <h5 className="mb-0 text-truncate">{match.homeTeam.name}</h5>
            </Col>
            <Col xs={4}>
              {/* Massive Timer Display */}
              <div className="display-3 fw-bold text-success mb-2" style={{ fontFamily: 'monospace' }}>
                {formatTime(secondsElapsed)}
              </div>
              <Button 
                variant={timerRunning ? "outline-danger" : "success"} 
                size="lg" 
                className="rounded-pill px-4"
                onClick={() => setTimerRunning(!timerRunning)}
              >
                {timerRunning ? <><Square size={18} className="me-2"/> Stop Time</> : <><Play size={18} className="me-2"/> Start Time</>}
              </Button>
            </Col>
            <Col xs={4}>
              <h5 className="mb-0 text-truncate">{match.awayTeam.name}</h5>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* SECTION 2: RAPID ACTION BUTTONS (Contextual to Home/Away) */}
      <Row className="g-3 mb-4">
        {/* HOME TEAM ACTIONS */}
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-success text-white fw-bold">Home Actions</Card.Header>
            <Card.Body className="d-grid gap-3">
              <Button variant="outline-success" size="lg" className="py-3 fw-bold" onClick={() => openActionModal('GOAL_HOME')}>
                <Goal className="me-2"/> GOAL (HOME)
              </Button>
              <Row className="g-2">
                <Col><Button variant="outline-warning" className="w-100 py-3 fw-bold" onClick={() => openActionModal('YELLOW_HOME')}>Yellow</Button></Col>
                <Col><Button variant="outline-danger" className="w-100 py-3 fw-bold" onClick={() => openActionModal('RED_HOME')}>Red</Button></Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* AWAY TEAM ACTIONS */}
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-secondary text-white fw-bold">Away Actions</Card.Header>
            <Card.Body className="d-grid gap-3">
              <Button variant="outline-secondary" size="lg" className="py-3 fw-bold" onClick={() => openActionModal('GOAL_AWAY')}>
                <Goal className="me-2"/> GOAL (AWAY)
              </Button>
              <Row className="g-2">
                <Col><Button variant="outline-warning" className="w-100 py-3 fw-bold" onClick={() => openActionModal('YELLOW_AWAY')}>Yellow</Button></Col>
                <Col><Button variant="outline-danger" className="w-100 py-3 fw-bold" onClick={() => openActionModal('RED_AWAY')}>Red</Button></Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* GENERAL ACTIONS */}
      <div className="d-grid">
        <Button variant="dark" size="lg" className="py-3" onClick={() => openActionModal('INJURY')}>
          <AlertTriangle className="me-2"/> Log Injury / Stoppage
        </Button>
      </div>

      {/* SECTION 3: THE CONTEXTUAL POP-UP MODAL */}
      {/* "centered" keeps it in the middle of the phone screen for easy thumb reach */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Modal.Header closeButton className={actionType.includes('GOAL') ? 'bg-success text-white' : 'bg-dark text-white'}>
          <Modal.Title>
            Log Event at {currentGameMinute}' min
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Select Player (Optional)</Form.Label>
              <Form.Select 
                size="lg"
                value={selectedPlayer} 
                onChange={(e) => setSelectedPlayer(e.target.value)}
              >
                <option value="">-- Unknown / Not Applicable --</option>
                {getRelevantPlayers().map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} {p.position ? `(${p.position})` : ''}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label className="text-muted">Quick Notes (e.g., Shot from distance)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveEvent} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save to Cloud'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default LiveMatch;