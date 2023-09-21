import React, { useState } from 'react';

function MergeComponents() {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [addressValueMap, setAddressValueMap] = useState(new Map());

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setError(null);
    setResult(null);
    setAddressValueMap(new Map());
  };

  const validateInput = () => {
    const lines = inputText.split('\n').filter((line) => line.trim() !== '');
    const newAddressValueMap = new Map();
    const errors = [];
    const validAddresses = [];
    const duplicateAddresses = new Map();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const parts = line.split(/[=, ]+/); // Split by '=', space, or comma

      if (parts.length === 2) {
        const [address, value] = parts;
        const intValue = parseInt(value, 10);

        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
          errors.push(`Line ${i + 1}: Invalid Ethereum address: ${address}`);
        } else if (isNaN(intValue)) {
          errors.push(`Line ${i + 1}: Invalid value: ${value}`);
        } else {
          if (newAddressValueMap.has(address)) {
            if (!duplicateAddresses.has(address)) {
              duplicateAddresses.set(address, [newAddressValueMap.get(address)]);
            }
            duplicateAddresses.get(address).push(i + 1);
          } else {
            newAddressValueMap.set(address, intValue);
            validAddresses.push({ address, amount: intValue });
          }
        }
      } else {
        errors.push(`Line ${i + 1}: Incorrect format: ${line}`);
      }
    }

    // Check for duplicate addresses
    duplicateAddresses.forEach((lines, address) => {
      errors.push(`Duplicate address ${address} found in lines: ${lines.join(', ')}`);
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      setResult(null);
      setAddressValueMap(new Map());
    } else {
      setError(null);
      setResult(validAddresses);
      setAddressValueMap(newAddressValueMap);
    }
  };

  return (
    <div className="container" style={{ width: '60vw' }}>
      <h4 className="mt-3" style={{ textAlign: 'left' }}></h4>
      <div className="mb-3" style={{ textAlign: 'left', color: 'grey', fontSize: '0.8rem', fontWeight: '500' }}>
        <p> Addresses with Amounts </p>
        <textarea
          className="form-control"
          style={{ background: '#f5f5fa' }}
          rows="9"
          value={inputText}
          onChange={handleInputChange}
        />
        <p style={{ textAlign: 'left', color: 'grey', fontSize: '0.8rem', fontWeight: '500' }}>
        Separate by ',' or '='
        </p>
      </div>

      {error && (
        <div className="row">
          <div className="col text-left" style={{ color: "red", textAlign: "left" }}>
            Duplicate
          </div>
          <div className="col text-right" style={{ color: "red", textAlign: "right" }}>
            Keep the first line | Combine Balance
          </div>
          <div className="alert alert-danger mt-3" role="alert">
            <span className='me-3'><i className="fa fa-exclamation-circle" aria-hidden="true"></i></span>
            {error}
          </div>
        </div>
      )}

      {result && (
        <div className="alert alert-success mt-3 " role="alert">
          <span className='me-3'><i className="fa fa-check-circle" aria-hidden="true"></i></span>
          Input is valid. You can perform further actions here.
        </div>
      )}

      {result && (
        <div className="result mt-3">
          <h5>Result:</h5>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {result && (
        <div className="result mt-3">
          <h5>Processed Address-Value Pairs:</h5>
          <ul>
            {Array.from(addressValueMap).map(([address, value]) => (
              <li key={address}>
                Address: {address}, Value: {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="btn btn-primary mt-3 w-100" style={{ background: "purple", color: "white" }} onClick={validateInput}>
        Next
      </button>
    </div>
  );
}

export default MergeComponents;


