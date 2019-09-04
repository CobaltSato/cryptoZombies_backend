var contract;
var userAccount;
async function startApp() {
    await web3.eth.getAccounts((error, accounts) => {
        if (accounts[0] !== userAccount) {
            userAccount = accounts[0];
        }
    })
    var accountInterval = setInterval(async () => {
        await web3.eth.getAccounts(async (error, accounts) => {
            if (accounts[0] != userAccount) {
                userAccount = accounts[0];
                window.location.href = "./index.html";
            }
        })
    }, 100);

    contract = await new web3.eth.Contract(contractABI, contractAddress);
    await contract.methods.isOwner().call({from:userAccount}).then( (isOwner) =>{
        if(isOwner){
//            alert('ログインに成功しました');
        }
        else{
            alert('ログインに失敗しました');
            window.location.href = "./index.html";
        }
    });
    await contract.methods.levelUpFee().call({from: userAccount}).then( (levelUpFee) =>{
        document.getElementById('fee').textContent = "levelUpFee: " +
        web3.utils.fromWei(levelUpFee,'ether');
    });
    await contract.methods.getThisBalance().call({from: userAccount}).then( (balance) =>{
        document.getElementById('balance').textContent = "balance: " +
        web3.utils.fromWei(balance,'ether');
    });
    // event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    /*
    await contract.events.OwnershipTransferred({
        fromBlock: web3.eth.blockNumber
    }, (error, event) => {
        window.alert('transfered!');
        window.location.href = "./index.html";
    })
    .on('error', console.error);
    */
}

window.addEventListener('load', () => {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        console.log('metamask not found');
    }
    startApp();
})

$("#btnWithdraw").click(async function (e) {
    //var name = $("#nameInput").val()
    await contract.methods.withdraw().send({ from: userAccount })
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
        })
        .on("error", (error) => {
            console.log(error);
        });

})
$("#btnSetLevelUpFee").click(async function (e) {
    var fee = $("#levelUpFee").val()
    await contract.methods.setLevelUpFee(web3.utils.toWei(fee,'ether')).send({ from: userAccount })
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
        })
        .on("receipt", (receipt) => {
                window.location.href = "./admin.html";
            console.log(receipt);
        })
        .on("error", (error) => {
            console.log(error);
        });

})
document.getElementById('btnChangeOwner').addEventListener(
    'click',
    async () => {
        var inputAddr = $('#changeOwner').val();
//         let addrBffr = ethereumjs.Util.toBuffer(inputAddr);
        if (!ethereumjs.Util.isValidAddress(inputAddr)) {
           alert('invalid addr' + inputAddr);
           return;
        }
        await contract.methods.transferOwnership(inputAddr)
        .send({ from: userAccount,})
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
            window.location.href = "./index.html";
            alert('権限を移行しました');
        })
        .on("error", (error) => {
            console.log(error);
        });
    }
)

document.getElementById('renounceOwnership').addEventListener(
    'click',
    async () => {
        await contract.methods.renounceOwnership()
        .send({ from: userAccount,})
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
            window.location.href = "./index.html";
            alert('権限を放棄しました');
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
            window.location.href = "./index.html";
            alert('権限を放棄しました');
        })
        .on("error", (error) => {
            console.log(error);
        });
    }
)
    /*
    await contract.methods.createRandomZombie(name).send({ from: userAccount })
        .on("transactionHash", (txHash) => {
            alert("Txhash: " + txHash);
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
        })
        .on("error", (error) => {
            console.log(error);
        });
        */