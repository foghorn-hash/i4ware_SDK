import React, { useState, useContext } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { LanguageContext } from "../../LanguageContext";
import './Timesheet.css';

const NumberValidator = ({ value, min = 0.1, max = 999.99 }) => {
    const { strings } = useContext(LanguageContext); 
  
    if (value === '' || value === null) return null;
  
    const val = Number(value);
  
    if (val < min) {
      return <Form.Text className="text-danger">{strings.messageTooSmall}</Form.Text>;
    }
  
    if (val > max) {
      return <Form.Text className="text-danger">{strings.messageTooBig}</Form.Text>;
    }
  
    return null;
};

export default function Timesheet({
    meta,
    setMeta,
    submitted,
    handleSubmit,
    clearAll,
    toggleExtras,
    toggleOvertime,
    showExtras,
    showOvertime,
    showExtrasMessage,
    showOvertimeMessage,
    strings,
    statusMessage,
}) {
    return (
        <Form onSubmit={handleSubmit}>
        <Row className="g-3">

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.timesheetNameLabel}</Form.Label>
                <Form.Control 
                value={meta.nimi || ""} 
                onChange={e=>setMeta({...meta, nimi:e.target.value})} 
                placeholder={strings.timesheetNamePlaceholder}
                /> 
                {submitted && !meta.nimi && (
                <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                )}
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.employeeLabel}</Form.Label>
                <Form.Control 
                value={meta.tyontekija || ""} 
                onChange={e=>setMeta({...meta, tyontekija:e.target.value})} 
                placeholder={strings.employeePlaceholder}
                />
                {submitted && !meta.tyontekija && (
                <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                )}
            </Form.Group>
            </Col>

            <Col md={6}>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.jobTitleLabel}</Form.Label>
                <Form.Control 
                value={meta.ammattinimike || ""} 
                onChange={e=>setMeta({...meta, ammattinimike:e.target.value})} 
                placeholder={strings.jobTitlePlaceholder}
                />
                {submitted && !meta.ammattinimike && (
                <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                )}
            </Form.Group>
            </Col>

            <hr></hr>

            <Col md={6}>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.projectLabel}</Form.Label>
                <Form.Control 
                value={meta.project || ""} 
                onChange={e=>setMeta({...meta, project:e.target.value})} 
                placeholder={strings.projectPlaceholder}
                />
                {submitted && !meta.project && (
                <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                )}
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.dateLabel}</Form.Label>
                <Form.Control 
                type="date" 
                key={`pvm-${meta.pvm}`}
                value={meta.pvm || ""} 
                onChange={e=>setMeta({...meta, pvm:e.target.value})}
                />
                {submitted && !meta.pvm && (
                <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                )}
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.startTimeLabel}</Form.Label>
                <Form.Control 
                className="flex-grow-1"
                type="time"
                key={`klo_alku-${meta.klo_alku}`}
                value={meta.klo_alku || ''} 
                onChange={e => setMeta({ ...meta, klo_alku: e.target.value })}
                />
                {submitted && !meta.klo_alku && (
                <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                )}
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.endTimeLabel}</Form.Label>
                <Form.Control 
                className="flex-grow-1"
                type="time" 
                key={`klo_loppu-${meta.klo_loppu}`}
                value={meta.klo_loppu || ''} 
                onChange={e => setMeta({ ...meta, klo_loppu: e.target.value })}
                />
                {submitted && !meta.klo_loppu && (
                <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                )}
            </Form.Group>
            </Col>

            <Col md={6}>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.normalHoursLabel}</Form.Label>
                <Form.Control 
                type="number" 
                step={0.1} 
                value={meta.norm  || ""} 
                onChange={e=>setMeta({...meta, norm:e.target.value})} 
                placeholder={strings.normalHoursPlaceholder}
                />
                {submitted && (meta.norm === '' || Number(meta.norm) <= 0) && (
                <span className="error" style={{ color: 'red' }}>{strings.requiredField}</span>
                )}
                <NumberValidator value={meta.norm} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

        {showExtras && (
        <>
            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.extrasLaLabel}</Form.Label>
                <Form.Control 
                type="number"
                step={0.1} 
                value={meta.lisatLa || ""} 
                onChange={e=>setMeta({...meta, lisatLa:e.target.value})} 
                placeholder={strings.extrasPlaceholder}
                />
                {showExtrasMessage && <Form.Text className="text-info">{strings.showExtrasPlaceholder}</Form.Text>}
                <NumberValidator value={meta.lisatLa} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.extrasSuLabel}</Form.Label>
                <Form.Control 
                type="number"
                step={0.1} 
                value={meta.lisatSu  || ""} 
                onChange={e=>setMeta({...meta, lisatSu:e.target.value})} 
                placeholder={strings.extrasPlaceholder}
                />
                {showExtrasMessage && <Form.Text className="text-info">{strings.showExtrasPlaceholder}</Form.Text>}
                <NumberValidator value={meta.lisatSu} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.extrasEveningLabel}</Form.Label>
                <Form.Control 
                type="number"
                step={0.1} 
                value={meta.lisatIlta || ""} 
                onChange={e=>setMeta({...meta, lisatIlta:e.target.value})} 
                placeholder={strings.extrasPlaceholder}
                />
                {showExtrasMessage && <Form.Text className="text-info">{strings.showExtrasPlaceholder}</Form.Text>}
                <NumberValidator value={meta.lisatIlta} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.extrasNightLabel}</Form.Label>
                <Form.Control 
                type="number"
                step={0.1} 
                value={meta.lisatYo || ""} 
                onChange={e=>setMeta({...meta, lisatYo:e.target.value})} 
                placeholder={strings.extrasPlaceholder}
                />
                {showExtrasMessage && <Form.Text className="text-info">{strings.showExtrasPlaceholder}</Form.Text>}
                <NumberValidator value={meta.lisatYo} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>
        </>
        )}

        {showOvertime && (
        <>
            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.overtimeVrk50Label}</Form.Label>
                <Form.Control 
                type="number"
                step={0.1} 
                value={meta.ylityoVrk50 || ""} 
                onChange={e=>setMeta({...meta, ylityoVrk50:e.target.value})} 
                placeholder={strings.overtimePlaceholder}
                />
                {showOvertimeMessage && <Form.Text className="text-info">{strings.showOvertimePlaceholder}</Form.Text>}
                <NumberValidator value={meta.ylityoVrk50} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.overtimeVrk100Label}</Form.Label>
                <Form.Control 
                type="number"
                step={0.1} 
                value={meta.ylityoVrk100 || ""} 
                onChange={e=>setMeta({...meta, ylityoVrk100:e.target.value})} 
                placeholder={strings.overtimePlaceholder}
                />
                {showOvertimeMessage && <Form.Text className="text-info">{strings.showOvertimePlaceholder}</Form.Text>}
                <NumberValidator value={meta.ylityoVrk100} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.overtimeVko50Label}</Form.Label>
                <Form.Control 
                type="number"
                step={0.1} 
                value={meta.ylityoVko50 || ""} 
                onChange={e=>setMeta({...meta, ylityoVko50:e.target.value})} 
                placeholder={strings.overtimePlaceholder}
                />
                {showOvertimeMessage && <Form.Text className="text-info">{strings.showOvertimePlaceholder}</Form.Text>}
                <NumberValidator value={meta.ylityoVko50} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.overtimeVko100Label}</Form.Label>
                <Form.Control 
                type="number"
                step={0.1} 
                value={meta.ylityoVko100 || ""} 
                onChange={e=>setMeta({...meta, ylityoVko100:e.target.value})} 
                placeholder={strings.overtimePlaceholder}
                />
                {showOvertimeMessage && <Form.Text className="text-info">{strings.showOvertimePlaceholder}</Form.Text>}
                <NumberValidator value={meta.ylityoVko100} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>
        </>
        )}

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.atvLabel}</Form.Label>
                <Form.Control 
                type="number" 
                step={0.1} 
                value={meta.atv || ""} 
                onChange={e=>setMeta({...meta, atv:e.target.value})} 
                placeholder={strings.extrasPlaceholder}
                />
                <NumberValidator value={meta.atv} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.travelLabel}</Form.Label>
                <Form.Control 
                type="number" 
                step={0.1} 
                value={meta.matk || ""} 
                onChange={e=>setMeta({...meta, matk:e.target.value})} 
                placeholder={strings.extrasPlaceholder}
                />
                <NumberValidator value={meta.matk} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.mealLabel}</Form.Label>
                <Form.Control 
                type="number"
                value={meta.ateriakorvaus || ""} 
                onChange={e=>setMeta({...meta, ateriakorvaus:e.target.value})}
                placeholder={strings.mealLabel}
                />
                <NumberValidator value={meta.ateriakorvaus} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>  

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.kmLabel}</Form.Label>
                <Form.Control 
                type="number" 
                step={0.1} 
                value={meta.km || ""} 
                onChange={e=>setMeta({...meta, km:e.target.value})}
                placeholder={strings.kmPlaceholder}
                />
                <NumberValidator value={meta.km} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

            {parseFloat(meta.km) > 0 && (
            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.kmNoteLabel}</Form.Label>
                <Form.Control 
                as="textarea" 
                value={meta.km_selite || ""} 
                onChange={e=>setMeta({...meta, km_selite:e.target.value})} 
                placeholder={strings.kmNotePlaceholder}
                />
                <Form.Text className="text-info">
                {strings.kmDescInfo}
                </Form.Text>
            </Form.Group>
            </Col>
        )}

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.toolCompLabel}</Form.Label>
                <Form.Control 
                type="number" 
                value={meta.tyokalukorvaus || ""} 
                onChange={e=>setMeta({...meta, tyokalukorvaus:e.target.value})} 
                placeholder={strings.toolCompPlaceholder}
                />
                <NumberValidator value={meta.tyokalukorvaus} min={0.1} max={999.99} message="Liian iso luku" />
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">Päiväraha</Form.Label>
                <Form.Select
                className="form-control"
                value={meta.paivaraha || 'ei'}
                onChange={(e) => setMeta({...meta, paivaraha: e.target.value})}
                >
                <option value="ei">Ei</option>
                <option value="osa">Osa</option>
                <option value="koko">Koko</option>
                </Form.Select>
            </Form.Group>
            </Col>
            
            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.noteLabel}</Form.Label>
                <Form.Control 
                as="textarea" 
                value={meta.huom || ""} 
                onChange={e=>setMeta({...meta, huom:e.target.value})} 
                placeholder={strings.notePlaceholder}
                />
            </Form.Group>
            </Col>

            <Col md>
            <Form.Group>
                <Form.Label className="small text-muted">{strings.memoLabel}</Form.Label>
                <Form.Control 
                as="textarea" 
                value={meta.memo || ""} 
                onChange={e=>setMeta({...meta, memo:e.target.value})} 
                placeholder={strings.memoPlaceholder}
                />
            </Form.Group>
            </Col>
        </Row>

        {statusMessage && (
        <Row className="mb-2">
            <Col>
            <div className={`save-status ${statusMessage.includes('epäonnistui') ? 'error' : 'success'}`}>
                {statusMessage}
            </div>
            </Col>
        </Row>
        )}

        <Row className="g-2 mt-3">
            <Col xs="auto">
            <Button 
                size="sm" 
                variant="primary" 
                onClick={toggleExtras}>{showExtras? strings.toggleExtrasHide : strings.toggleExtrasShow}
            </Button>

            <Button 
                size="sm" 
                variant="secondary" 
                onClick={toggleOvertime}>{showOvertime? strings.toggleOvertimeHide : strings.toggleOvertimeShow}
            </Button>
            </Col>
            
            <Col className="text-end">
            <Button 
                size="sm" 
                variant="success" 
                className="me-2" 
                type="submit">{strings.addRowButton}
            </Button>

            <Button 
                size="sm" 
                variant="outline-danger" 
                onClick={clearAll}>{strings.clearAllButton}
            </Button>
            </Col>
        </Row>
        </Form>
    )
};