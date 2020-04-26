

let dataArr;
const outputFieldIDs = ['start-date', 'end-date', 'income', 'expenses', 'difference']

function getInputFieldIDKeys() {
    let keyObj = {} 
    keyObj.sumkey = document.getElementById('headers-map-sum').value
    keyObj.datekey = document.getElementById('headers-map-date').value
    keyObj.recipientkey = document.getElementById('headers-map-recipient').value
    keyObj.dateformat = document.getElementById('date-format').value;
    return keyObj
}

let processDataButton = document.getElementById('process-data')
    processDataButton.addEventListener('click', function () {
            keys = getInputFieldIDKeys()
            output = processData(keys.sumkey, keys.datekey, keys.recipientkey, keys.dateformat);
            document.getElementById('income').innerText = "+" + output.income.total;
            document.getElementById('expenses').innerText = output.expenses.total;
            document.getElementById('difference').innerText = output.difference;

            // abstract the below into a function
            var ungroup = document.getElementById('ungroup-button')
            var group = document.getElementById('group-recipient-button')
            if (!ungroup.classList.contains('hide')) {
                ungroup.classList.toggle('hide')
                 group.classList.toggle('hide')
             }


           
    });


    function getData() {
        const data = localStorage.getItem('data')
        try {
            return data ? JSON.parse(data) : []
        } catch (e) {
            return []
        }
    }



    function clearValues(fieldIDs) {
        fieldIDs.forEach(function (ID) {
             document.getElementById(ID).innerText = ""
        })
    }


 let uploadCSVFile = document.getElementById('csv-file')
 uploadCSVFile.addEventListener('change', function (e) {
     let result = readFile(e.target.files[0]) 
     moveProgress()
     setTimeout(function () {
         headerMapper(data, 'headers-map-sum')
         headerMapper(data, 'headers-map-date')
         headerMapper(data, 'headers-map-recipient')
         document.getElementById('field-maps').classList.remove('hide')
     }, 3000)

 });


incomeButton = document.getElementById('income')
expensesButton = document.getElementById('expenses')

incomeButton.addEventListener('click', function () {
    let keys = getInputFieldIDKeys()
    renderItems(output.income.entries, keys.sumkey, keys.datekey, keys.recipientkey)
});

expensesButton.addEventListener('click', function () {
    let keys = getInputFieldIDKeys()
     renderItems(output.expenses.entries, keys.sumkey, keys.datekey, keys.recipientkey)
    
    });



 let groupRecipientButton = document.getElementById('group-recipient-button');
 groupRecipientButton.addEventListener('click', function () {
    let keys = getInputFieldIDKeys()
    let recipients = cleanRecipients(output.expenses.entries, keys.recipientkey)
    let grouped = groupTransactionsByRecipient(recipients, keys.sumkey, keys.recipientkey);
    groupRecipientButton.classList.toggle('hide')
    document.getElementById('ungroup-button').classList.toggle('hide')
    renderGroupedItemsTotal(grouped)

 });


 let ungroupButton = document.getElementById('ungroup-button');
 ungroupButton.addEventListener('click', function() {
       let keys = getInputFieldIDKeys()
       ungroupButton.classList.toggle('hide')
       document.getElementById('group-recipient-button').classList.toggle('hide')
       renderItems(output.expenses.entries, keys.sumkey, keys.datekey, keys.recipientkey)

 });

function moveProgress() {
    let i = 0;
    if (i == 0) {
        i = 1;
        let elem = document.getElementById("progress-bar");
        elem.style.width = 0 + "%"
        elem.classList.toggle('hide')
        let width = 0;
        let id = setInterval(frame, 1000);
        function frame() {
            if (width >= 100) {
                clearInterval(id);
                i = 0;
                elem.classList.toggle('hide')
            } else {
                width = width + 50;
                elem.style.width = width + "%";
            }
        }
    }
}



function headerMapper(data, element) {
    let headers
    if (data) {
    headers = Object.keys(data[0]);
    } else {
        return 
    }
    let select = document.getElementById(element)
    let container = document.getElementById('field-maps')
    let options = []

  // create regex arrays for automapping
  let regexArr
  if (element == 'headers-map-sum') {
      regexArr = [/\bSum/, /\bAmount/, /\bMäär/]
  } else if (element == 'headers-map-date') {
      regexArr = [/\b(D|d)ate\b/, /päivä\b/ ]
  } else if (element == 'headers-map-recipient') {
      regexArr = [/\bRec/, /\bSaa/]
  }
  let match
  let matchArr = []

    // remove previous options from a previous file upload
    if (select.options.length > 0) {
    for (var i = 0; i < options.length; i++) {
        options.pop()
    }
    select.innerHTML = ""
}


    // create options for each header
    headers.forEach(function (header) {
        options.push(document.createElement('option'));
        options[headers.indexOf(header)].value = header
        options[headers.indexOf(header)].innerText = header


    // match regex for auto-map below
regexArr.forEach(function (regex) {
 if (header.match(regex)) {
     match = header.match(regex)
     matchArr.push(match)
 }
});
       

    });
    options.forEach(function (option) {
        select.appendChild(option)
    });

    // auto-map options value
    if (matchArr[0]) {
    select.value = matchArr[0].input 
}
    container.classList.toggle = 'hide'    
}




function processData(sumkey, datekey, recipientkey, dateformat) {
    const output = {}
     clearValues(outputFieldIDs)
     data = getData()
     let converted = convertToNumbers(data, sumkey)
     if (typeof converted[0][datekey] != 'object') {
     converted = convertDates(converted, datekey, dateformat)
     }
     let sorted = sortByDate(converted, datekey)
     populateDates(sorted, datekey)
     output.expenses = getExpenses(sorted, sumkey)
     output.income = getIncome(sorted, sumkey)
     output.difference = getDifference(output.expenses, output.income)
    renderItems(output.income.entries, sumkey, datekey, recipientkey)
    return output 
}


function populateDates(sortedArr, datekey) {
    let dates = document.getElementById('dates')
    if (dates.classList.value == 'hide') {
        dates.classList.toggle('hide')
    }
    document.getElementById('start-date').innerText = sortedArr[0][datekey].toDateString()
    document.getElementById('end-date').innerText = sortedArr[sortedArr.length - 2][datekey].toDateString()
}

function convertToNumbers(bankStatement, sumkey) {
    bankStatement.forEach(function (entry) {
        entry[sumkey] = parseFloat(entry[sumkey]);
    });
    return bankStatement
}


function convertDates(bankStatement, datekey, format) {
    // if format is mm.dd.yyyy, dd/mm/yyyy, dd.mm.yyyy, we have to convert
    for (let i = 0; i < bankStatement.length; i++) {
        let temp
        let outputDate
    switch(format) {
        case 'dd.mm.yyyy':
        temp = bankStatement[i][datekey].split('.');
        temp.unshift(temp[1]);
        temp.splice(2, 1);
        outputDate = temp.join('/');
        break;
    case 'mm.dd.yyyy':
        temp = bankStatement[i][datekey].split('.');
        outputDate = temp.join('/');
        break;
    case 'dd/mm/yyyy':
     temp = bankStatement[i][datekey].split('/');
     temp.unshift(temp[1]);
     temp.splice(2, 1);
     outputDate = temp.join('/');
     break;
     default:
         outputDate = bankStatement[i][datekey]
     }
    bankStatement[i][datekey] = new Date(outputDate);
    }
    return bankStatement

} 

function sortByDate(bankStatement, datekey) {
    bankStatement.sort(function (a, b) {
        if (a[datekey] < b[datekey]) {
        return -1
        } else if (b[datekey] > a[datekey]) {
            return 1
        } else {
            return 0
        }
    });
    return bankStatement
}


function getExpenses(bankStatement, sumkey) {
    let output = {}
    output.total = 0;
    output.entries = []
    for (let i = 0; i < bankStatement.length; i++) {
        if (bankStatement[i][sumkey] < 0) {
        // create new expenses array
        output.entries.push(bankStatement[i])        
        // sum up total
        output.total += bankStatement[i][sumkey];
        }
    }
    output.total = Math.round(output.total)

    return output
}

function getIncome(bankStatement, sumkey) {
   let output = {}
   output.total = 0;
   output.entries = []
   for (var i = 0; i < bankStatement.length; i++) {
        if (bankStatement[i][sumkey] > 0) {
            // create new income array
            output.entries.push(bankStatement[i])
           // sum up total
           output.total += bankStatement[i][sumkey];
       }
   }
    output.total = Math.round(output.total)
   return output
   }



function getDifference(expenses, income) {
    let difference = income.total + expenses.total;
    return Math.round(difference)
}


function renderItems(bankStatement, sumkey, datekey, recipientkey) {
    document.getElementById('list').innerHTML = "";
    for (let i = 0; i < bankStatement.length; i++) {
    let li = document.createElement('li')
    li.innerHTML = `${bankStatement[i][datekey].toDateString()} | ${bankStatement[i][sumkey]} | ${bankStatement[i][recipientkey]}`
    document.getElementById('list').appendChild(li)
    }
}


// Cleans up recipient names so that they can more easily be grouped
function cleanRecipients(data, recipientkey) {
  recipients = []
    let regex = /\b[a-zA-Z]*\s[a-zA-Z]*|\b[a-zA-Z]*/
    data.forEach(function (item) {
        let match = regex.exec(item[recipientkey].toLowerCase())[0].trim();
        item[recipientkey] = match;
        if (recipients.indexOf(match) < 0)
            recipients.push(match)
    });
    return recipients
}

function groupTransactionsByRecipient(recipients, sumkey, recipientkey) {
    // Create an array where we store the grouped transactions
    let groupedTransactions = []
    recipients.forEach(function (rec) {
        let obj = {};
        obj['Recipient'] = rec;
        obj['Transactions'] = []
        groupedTransactions.push(obj)
    });

    // Do the actual sorting
    for (let i = 0; i < data.length; i++) {
        for (let y = 0; y < groupedTransactions.length; y++) {
            if (data[i][recipientkey] == groupedTransactions[y]['Recipient'])
                groupedTransactions[y]['Transactions'].push(data[i])
        }
    }

    // sum up totals
    groupedTransactions.forEach(function (item) {
        let total = 0;
        let transactions = item['Transactions'];
        for (let i = 0; i < transactions.length; i++) {
            total = total + transactions[i][sumkey]
        }
      item['Total'] = total;
    });

    // sort

      groupedTransactions.sort(function (a, b) {
          if (a['Total'] < b['Total']) {
              return -1
          } else if (b['Total'] > a['Total']) {
              return 1
          } else {
              return 0
          }
      });
     
    return groupedTransactions

}

function renderGroupedItemsTotal(groupeditems) {
    document.getElementById('list').innerHTML = ""
    groupeditems.forEach(function (item) {
        let li = document.createElement('li');
     li.innerHTML = `${item['Recipient'].toUpperCase()}: ${Math.floor(item['Total'])}`
     document.getElementById('list').appendChild(li);
});
};