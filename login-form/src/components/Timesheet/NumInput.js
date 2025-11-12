import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

/** === Numero-input joka forwardaa style ym. === */
  const Num = ({ value, onChange, step = 0.25, min = 0, max = 999.99, placeholder, style, className, required = false, ...rest }) => {
    const [error, setError] = React.useState('');
  
    const handleChange = (e) => {
      let val = Number(e.target.value || 0);
  
      if (val > max) {
        setError('Liian iso luku');
        return;
      } else if (val < min) {
        setError(`Ei voi olla pienempi kuin ${min}`);
        return;
      } else {
        setError('');
      }
  
      onChange(val);
    };
  
    return (
      <div>
        <Form.Control
          type="number"
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          size="sm"
          style={style}
          className={className}
          required={required}
          {...rest}
        />
        {error && <Form.Text className="text-danger">{error}</Form.Text>}
      </div>
    );
  };  

  export { Num };