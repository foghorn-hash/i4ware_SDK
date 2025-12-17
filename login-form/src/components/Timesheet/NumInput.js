import React, { useState, useContext, useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { LanguageContext } from "../../LanguageContext";

const Num = ({
  value,
  onChange,
  step = 0.25,
  min = 0.1,
  max = 999.99,
  placeholder,
  style,
  className,
  required = false,
  ...rest
}) => {
  const { strings } = useContext(LanguageContext);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleChange = (e) => {
    let val = Number(e.target.value || 0);

    if (val > max) {
      setError(strings.messageTooBig);
      return;
      
    } else if (val < min) {
      setError(strings.messageTooSmall);
      return;

    } else {
      setError('');
    }

    onChange(val);
  };

  // prevent page scrolling when mouse on number field, so you can use your mouse wheel to set value
  const handleWheel = (e) => {
    e.preventDefault(); 
    let val = Number(value || 0);
    val += e.deltaY < 0 ? step : -step;
    val = Math.min(Math.max(val, min), max);
    onChange(val);
  };

  // this helps to activate wheel function
  useEffect(() => {
    const input = inputRef.current;
    input.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      input.removeEventListener('wheel', handleWheel);
    };
  }, [value, step, min, max]);

  return (
    <div>
      <Form.Control
        type="number"
        value={value}
        onChange={handleChange}
        onWheel={handleWheel}
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
