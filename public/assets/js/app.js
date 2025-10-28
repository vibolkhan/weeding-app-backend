
// Locale & numeral helpers
if (typeof dayjs !== 'undefined') {
  dayjs.locale('km');
}

function convertToKhmerNumerals(number) {
  const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return number.toString().split('').map(digit => khmerNumerals[digit]).join('');
}

function replaceNumbersWithKhmer(text) {
  return text.split('').map(char => {
    const digit = parseInt(char, 10);
    return isNaN(digit) ? char : convertToKhmerNumerals(digit);
  }).join('');
}

// Alpine helpers
function dateFormatter(eventDate = null, showTime = false) {
  return {
    formattedDate: '',
    eventDate: eventDate ?? "2025-10-23 16:40:00",
    showTime: showTime,
    init() {
      if (typeof dayjs !== 'undefined') {
        dayjs.locale('km');
      }
      const dayjsDate = dayjs(this.eventDate);

      // Format date
      let formattedDate = dayjsDate.format('ថ្ងៃdddd ទី DD ខែ MMMM ឆ្នាំ YYYY');

      // Convert to Khmer numerals
      const dayInKhmer = convertToKhmerNumerals(dayjsDate.date());
      const yearInKhmer = convertToKhmerNumerals(dayjsDate.year());

      formattedDate = formattedDate
        .replace(dayjsDate.date(), dayInKhmer)
        .replace(dayjsDate.year(), yearInKhmer);

      // Optional time display
      if (this.showTime && typeof dateFns !== 'undefined') {
        const dateObj = new Date(this.eventDate);
        const timeInKhmer = dateFns.format(dateObj, 'ម៉ោង h:mm b', {
          locale: dateFns.locale.km
        });
        const timeInKhmerNumerals = replaceNumbersWithKhmer(timeInKhmer);
        this.formattedDate = `${formattedDate} ${timeInKhmerNumerals}`;
      } else {
        this.formattedDate = formattedDate;
      }
    }
  }
}

function timeFormatter(time) {
  return {
    time: time,
    formattedTime: '',
    init() {
      this.formattedTime = this.formatStringToTime(this.time);
    },
    formatStringToTime(timeString) {
      const [hour, minute, second] = timeString.split(':').map(Number);

      const tempDate = new Date();
      const updatedDate = dateFns.setSeconds(
        dateFns.setMinutes(dateFns.setHours(tempDate, hour), minute),
        second
      );

      const formattedTime = dateFns.format(updatedDate, 'ម៉ោង h:mm b', {
        locale: dateFns.locale.km
      });

      // Convert formatted time to Khmer numerals
      return formattedTime.split('').map(char => {
        return char.match(/\d/) ? convertToKhmerNumerals(char) : char;
      }).join('');
    }
  }
}
