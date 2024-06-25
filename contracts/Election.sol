pragma solidity ^0.7.0;

contract Election {
    // 후보자 Model
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // 투표한 스토어 계정
    mapping(address => bool) public voters;
    // 후보자 저장
    // 후보자 가져오기
    mapping(uint256 => Candidate) public candidates;
    // 후보자 수
    uint256 public candidatesCount;

    // voted event
    event votedEvent(uint256 indexed _candidateId);

    constructor() public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint256 _candidateId) public {
        // 이미 투표했다면 트랜잭션을 중단시킨다.
        require(!voters[msg.sender]);

        // 후보자 Id의 유효성을 확인한다.
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // 투표 기록을 남긴다.
        voters[msg.sender] = true;

        // 해당 후보자의 투표수를 증가시킨다.
        candidates[_candidateId].voteCount++;

        // 투표 이벤트 트리거
        emit votedEvent(_candidateId);
    }
}