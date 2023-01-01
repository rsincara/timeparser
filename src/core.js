const NEED_MINUTES = 8 * 60;

const parseTimeInfo = (timeInfo, separator) => {
    const splitTimeInfo = timeInfo.split(separator).map((item) => item.trim());

    return {
        time: splitTimeInfo[0],
        done: splitTimeInfo[1],
    }
}

const parseTimeToMinutes = (time) => {
    if (time.includes('m') && time.includes('h')) {
        const splitTime = time.split(' ');

        return parseTimeToMinutes(splitTime[0]) + parseTimeToMinutes(splitTime[1]);
    }

    if (time.includes('h')) {
        return Number(time.replace('h', '')) * 60;
    }

    return  Number(time.replace('m', ''));
}

document.getElementById('help').onclick = () => {
  document.querySelector('.modal-overlay').style.display = 'block';
  document.querySelector('.modal-wrapper').style.display = 'flex';
};

document.getElementById('overlay').onclick = () => {
    document.querySelector('.modal-overlay').style.display = 'none';
    document.querySelector('.modal-wrapper').style.display = 'none';
};

document.getElementById('clear').onclick = () => {
    document.querySelector('.result').style.display = 'none';

    document.getElementById('remaining').innerHTML = '';
    document.getElementById('largest-time').innerHTML = '';
    document.getElementById('lowest-time').innerHTML = '';
}

document.getElementById('calculate-btn').onclick = () => {
    const splitData = document.getElementById('user-input').value.split('\n').filter(Boolean);

    const groupTasksWithTimeInfo = splitData.reduce((accum, current) => {
        const isCurrentItemTitle = Number.isNaN(Number(current[0]));

        if (isCurrentItemTitle) {
            accum.push({
                title: current,
                timeInfo: [],
            })
        } else {
            accum.at(-1).timeInfo.push(parseTimeInfo(current, '-'));
        }
        return accum;
    }, []);

    const tasksWithSpentMinutes = groupTasksWithTimeInfo.map((task) => {
        const spentTime = task.timeInfo.reduce((accum, current) => {
            return accum + parseTimeToMinutes(current.time);
        }, 0);

        return {
            title: task.title,
            spentTime,
        }
    })

    const spentTimeSumMinutes = tasksWithSpentMinutes.reduce((acc, curr) => (
        acc + curr.spentTime
    ), 0);

    const sortedTaskByTimeSpent = [...tasksWithSpentMinutes].sort((a,b) => a.spentTime - b.spentTime);

    const taskWithLowestTimeSpent = sortedTaskByTimeSpent.at(0);
    const taskWithLargestTimeSpent = sortedTaskByTimeSpent.at(-1);

    const remainingTime = NEED_MINUTES - spentTimeSumMinutes;

    const showResults = () => {
        document.querySelector('.result').style.display = 'block';

        document.getElementById('remaining').innerHTML =
            `Осталось доработать (минут): <span>${remainingTime}</span>`;

        document.getElementById('lowest-time').innerHTML =
            `Задача с наименьшими затратами (минуты): <span>${taskWithLowestTimeSpent.title} : ${taskWithLowestTimeSpent.spentTime}</span>`

        document.getElementById('largest-time').innerHTML =
            `Задача с наибольшими затратами (минуты): <span>${taskWithLargestTimeSpent.title} : ${taskWithLargestTimeSpent.spentTime}</span>`
    };

    if (remainingTime >= 0) {
        showResults();
    } else {
        alert(`Переработка! Вы переработали (минут): ${Math.abs(remainingTime)}`)
    }
}
