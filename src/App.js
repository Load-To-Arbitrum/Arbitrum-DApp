import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Election from './contracts/Election.json';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractAddress = '0x2Ed9eD08106602FF7e507462F17340f1a308E241'; // 배포된 컨트랙트 주소
  const contract = new ethers.Contract(contractAddress, Election.abi, signer);

  useEffect(() => {
    async function connectMetaMask() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          console.log('Connected account:', accounts[0]);
        } catch (error) {
          console.error('MetaMask connection error:', error);
          setError('Failed to connect to MetaMask');
        }
      } else {
        console.error('MetaMask is not installed');
        setError('MetaMask is not installed');
      }
    }

    connectMetaMask();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
        setError(null);
        console.log('Account changed:', accounts[0]);
      });

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    }
  }, []);

  const fetchCandidates = async () => {
    if (!account) return;

    try {
      const candidatesCount = await contract.candidatesCount();
      console.log('Candidates Count:', candidatesCount.toNumber());
      let candidatesArray = [];
      for (let i = 1; i <= candidatesCount; i++) {
        let candidate = await contract.candidates(i);
        candidatesArray.push({
          id: candidate.id.toNumber(),
          name: candidate.name,
          voteCount: candidate.voteCount.toNumber()
        });
        console.log('Fetched candidate:', {
          id: candidate.id.toNumber(),
          name: candidate.name,
          voteCount: candidate.voteCount.toNumber()
        });
      }
      setCandidates(candidatesArray);
      setLoading(false);
      console.log('Candidates:', candidatesArray);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Error fetching candidates');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [account]);

  const vote = async (candidateId) => {
    try {
      await contract.vote(candidateId);
      setVoted(true);
      fetchCandidates(); // 투표 후 후보자 데이터 다시 불러오기
    } catch (error) {
      console.error('Error voting:', error);
      setError('Error voting');
    }
  };

  const reconnectMetaMask = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setError(null);
      console.log('Reconnected account:', accounts[0]);
    } catch (error) {
      console.error('MetaMask connection error:', error);
      setError('Failed to reconnect to MetaMask');
    }
  };

  return (
    <div>
      <h1>Voting DApp</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {account ? (
        loading ? (
          <p>Loading candidates...</p>
        ) : (
          <div>
            <p>Connected account: {account}</p>
            {candidates.map((candidate) => (
              <div key={candidate.id}>
                <h2>{candidate.name}</h2>
                <p>Votes: {candidate.voteCount}</p>
                <button onClick={() => vote(candidate.id)} disabled={voted}>
                  Vote
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          <p>Please connect to MetaMask</p>
          <button onClick={reconnectMetaMask}>Reconnect MetaMask</button>
        </div>
      )}
    </div>
  );
}

export default App;
