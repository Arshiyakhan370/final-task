import React, { useState } from 'react';

function MergeComponents() {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [addressValueMap, setAddressValueMap] = useState(new Map());
  const [hasDuplicates, setHasDuplicates] = useState(false); // New state variable

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setError(null);
    setResult(null);
    setAddressValueMap(new Map());
    setHasDuplicates(false); // Reset the duplicate state when input changes
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

        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
          errors.push(`Line ${i + 1}: Invalid Ethereum address: ${address}`);
        } else if (!/^\d+$/.test(value)) {
          errors.push(`Line ${i + 1} wrong amount`);
        } else {
          const intValue = parseInt(value, 10);
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
      errors.push(`Address ${address} encountered duplicate in Line: ${lines.join(', ')}`);
    });

    if (errors.length > 0) {
      setError(errors.join('\n\n'));
      setResult(null);
      setAddressValueMap(new Map());
      setHasDuplicates(true); // Set the duplicate state to true
    } else {
      setError(null);
      setResult(validAddresses);
      setAddressValueMap(newAddressValueMap);
      setHasDuplicates(false); // Set the duplicate state to false
    }
  };

  const keepFirstOne = () => {
    const lines = inputText.split('\n').filter((line) => line.trim() !== '');
    const newLines = [];
    const seenAddresses = new Set();

    for (const line of lines) {
      const [address] = line.split(/[=, ]+/);

      if (!seenAddresses.has(address)) {
        newLines.push(line);
        seenAddresses.add(address);
      }
    }

    setInputText(newLines.join('\n'));
    setHasDuplicates(false); // Reset the duplicate state when clicking "Keep the first one"
  };

  const combineBalance = () => {
    const lines = inputText.split('\n').filter((line) => line.trim() !== '');
    const newAddressValueMap = new Map();

    for (const line of lines) {
      const [address, value] = line.split(/[=, ]+/);

      if (!newAddressValueMap.has(address)) {
        newAddressValueMap.set(address, 0);
      }

      newAddressValueMap.set(address, newAddressValueMap.get(address) + parseInt(value, 10));
    }

    const newLines = Array.from(newAddressValueMap.entries()).map(([address, value]) => `${address}=${value}`);

    setInputText(newLines.join('\n'));
    setHasDuplicates(false); // Reset the duplicate state when clicking "Combine Balance"
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

      {/* Conditionally render the "Keep the first one" and "Combine Balance" buttons */}
      {hasDuplicates && (
        <div className="row">
          <div className="col text-left" style={{ color: "red", textAlign: "left" }}>
            Duplicate
          </div>
          <div className="col text-right" style={{ color: "red", textAlign: "right" }}>
            <button className="btn btn-danger" onClick={keepFirstOne}>
              Keep the first one
            </button>
            <button className="btn btn-primary ms-2" onClick={combineBalance}>
              Combine Balance
            </button>
          </div>
        </div>
      )}

      {hasDuplicates && error && (
        <div className="alert alert-danger mt-3" role="alert">
          <span className='me-3'><i className="fa fa-exclamation-circle" aria-hidden="true"></i></span>
          {error.split('\n\n').map((errorMessage, index) => (
            <div key={index}>
              {errorMessage}
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className="result mt-3" style={{textAlign:"left"}}>
          <h5>Address:</h5>
          <ul style={{ listStyleType: 'none', textAlign:"left"}}>
            {Array.from(addressValueMap.keys()).map((address) => (
              <li key={address}>
                {address}
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
