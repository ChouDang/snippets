


// Get value
// Cho trước một object hoặc array - hàm sẽ trả về value tại đường dẫn (path) đã được chỉ định, nếu không thì null.

const getValue = (obj, path) => path
    .replace(/\[([^[\]]*)]/g, '.$1.')
    .split('.')
    .filter(prop => prop !== '')
    .reduce((prev, next) => (
        prev instanceof Object ? prev[next] : undefined
    ), obj);

getValue({ a: { b: { c: 'd' } } }, 'a.b.c'); // = d
getValue({ a: { b: { c: [1, 2] } } }, 'a.b.c[1]'); // = 2

// Clamp
// Đảm bảo một value nằm trong một phạm vi được chỉ định, nếu không, "clamp" với value gần nhất của giá trị minimum và maximum.

const clamp = (min, max, value) => {
  if (min > max) throw new Error('min cannot be greater than max');
  return value < min
    ? min
    : value > max
      ? max
      : value;
}

clamp(0, 10, -5); // = 0

// Sleep
// Chờ trong khoảng thời gian duration mili giây trước khi thực hiện thao tác tiếp theo. Cách làm này nhìn sẽ rất đồng bộ.

const sleep = async (duration) => (
  new Promise(resolve =>
    setTimeout(resolve, duration)
  )
);

// DoSomething();
await sleep(1000); // waits 1 sec
// Sau khi chờ 1s thì thực hiện tiếp cái gì đó
// DoSomething();

// Group by
// Nhóm và lập chỉ mục các mục liên quan trong một đối tượng theo keying-function.

const groupBy = (fn, list) => (
  list.reduce((prev, next) => ({
    ...prev,
    [fn(next)]: [...(prev[fn(next)] || []), next]
  }), {})
);

groupBy(vehicle => vehicle.make, [
  { make: 'tesla', model: '3' },
  { make: 'tesla', model: 'y' },
  { make: 'ford', model: 'mach-e' },
]);

// { 
//   tesla: [ { make: 'tesla', ... }, { make: 'tesla', ... } ],
//   ford: [ { make: 'ford', ... } ],
// }

// Bonus: Khi các bạn control được các Snippets này thì việc biến tấu nó cho phù hợp với task thì quá đơn giản luôn.

export function groupBy(list, fnKey, fnValue = (e) => e) {
  return list.reduce(
    (prev, next) => ({
      ...prev,
      [fnKey(next)]: [...(prev[fnKey(next)] || []), fnValue(next)],
    }),
    {}
  );
}

// Collect By
// Tạo danh sách con chứa các mục liên quan theo keying-function .

// Tận dụng hàm trước đó đã viết
// Đó cũng là cách mà chúng ta sẽ chia nhỏ mọi thứ
import groupBy from './groupBy';

const collectBy = (fn, list) => 
  Object.values(groupBy(fn, list));

collectBy(vehicle => vehicle.make, [
  { make: 'tesla', model: '3' },
  { make: 'tesla', model: 'y' },
  { make: 'ford', model: 'mach-e' },
]);

// [ 
//   [ { make: 'tesla', ... }, { make: 'tesla', ... } ],
//   [ { make: 'ford', ... } ],
// ]

// Head
// Lấy phần tử đầu tiên của danh sách. Function này rất hữu ích để code của chúng ta writing clean and readable code.

const head = list => list[0];

head([1, 2, 3]); // = 1
head([]); // = undefined

// Tail
// Nhận tất cả trừ phần tử đầu tiên của danh sách. Function này cũng rất hữu ích cho việc writing clean and readable code.

const tail = list => list.slice(1);

tail([1, 2, 3]); // = [2, 3]
tail([]); // = []

// Flatten
// Tạo một danh sách phẳng bằng cách kéo tất cả các mục từ các danh sách con lồng nhau bằng cách sử dụng đệ quy - recursively.

const flatten = list => list.reduce((prev, next) => ([
  ...prev,
  ...(Array.isArray(next) ? flatten(next) : [next])
]), []);

flatten([[1, 2, [3, 4], 5, [6, [7, 8]]]]); // = [1, 2, 3, 4, 5, 6, 7, 8]

// Intersection By
// Tìm tất cả các value có trong cả hai danh sách như được xác định bởi một keying-function. Ùi cái hàm này trong dự án mình xài nhiều cực kỳ.

const intersectionBy = (fn, listA, listB) => {
  const b = new Set(listB.map(fn));
  return listA.filter(val => b.has(fn(val)));
};

intersectionBy(v => v, [1, 2, 3], [2, 3, 4]); // = [2, 3]
intersectionBy(v => v.a, [{ a: 1 }, { a: 2 }], [{ a: 2}, { a: 3 }, { a: 4 }]); // = [{ a: 2 }];

// Index By
// Lập chỉ mục từng phần tử trong danh sách theo một value được xác định bởi keying-function.

const indexBy = (fn, list) =>
  list.reduce((prev, next) => ({
    ...prev,
    [fn(next)]: next
  }), {});
              
indexBy(val => val.a, [{ a: 1 }, { a: 2 }, { a: 3 }]); 
// = { 1: { a: 1 }, 2: { a:2 }, 3: { a: 3 } }

// Difference By
// Tìm tất cả các mục trong danh sách đầu tiên không có trong danh sách thứ hai - được xác định bởi keying-function.

// import indexBy from './indexBy';

const differenceBy = (fn, listA, listB) => {
  const bIndex = indexBy(fn, listb);
  return listA.filter(val => !bIndex[fn(val)]);
}

differenceBy(val => val, [1,2,3], [3,4,5]); // = [1,2]
differenceBy(
  vehicle => vehicle.make, 
  [{ make: 'tesla' }, { make: 'ford' }, { make: 'gm' }], 
  [{ make: 'tesla' }, { make: 'bmw' }, { make: 'audi' }], 
); // = [{ make: 'ford' }, { make: 'gm' }]

// Recover With
// Trả về value mặc định nếu hàm đã cho throw một Error.

const recoverWith = async (defaultValue, fn, ...args) => {
  try {
    const result = await fn(...args);
    return result;
  } catch (_e) {
    return defaultValue;
  }
}

recoverWith('A', val => val, 'B'); // = B
recoverWith('A', () => { throw new Error() }); // = 'A'

// Distance
// Tính khoảng cách Ơclit giữa hai điểm p1 & p2. Cái này nếu bạn nào làm mấy cái game nhỏ nhỏ bằng JS hoặc Animation thì hay dùng lắm. Nếu các bạn quên khoảng cách Ơclit là gì thì tham khảo ở đây.

const distance = ([x0, y0], [x1, y1]) => (
  Math.hypot(x1 - x0, y1 - y0)
);

distance([0, 1], [5, 4]); // = 5.8309518948453

// Drop While
// Bỏ các phần tử khỏi danh sách, bắt đầu từ phần tử đầu tiên, cho đến khi gặp phần tử đầu tiên đúng với điều kiện.

const dropWhile = (pred, list) => {
  let index = 0;
  list.every(elem => {
    index++;
    return pred(elem);
  });
  return list.slice(index-1);
}

dropWhile(val => (val < 5), [1,2,3,4,5,6,7]); // = [5,6,7]

// Sum By
// Tính tổng của tất cả các phần tử trong một danh sách cho trước theo keying-function đã được đưa vào.

const sumBy = (fn, list) =>
  list.reduce((prev, next) => prev + fn(next), 0);

sumBy(product => product.price, [
  { name: 'pizza', price: 10 }, 
  { name: 'pepsi', price: 5 },
  { name: 'salad', price: 5 },
]); // = 20

// Ascending
// Tạo một hàm so sánh tăng dần với một valuating-function.

const ascending = (fn) => (a, b) => {
  const valA = fn(a);
  const valB = fn(b);
  return valA < valB ? -1 : valA > valB ? 1 : 0;
}

const byPrice = ascending(val => val.price);
[{ price: 300 }, { price: 100 }, { price: 200 }].sort(byPrice); 
// = [{ price: 100 }, { price: 200 }, { price: 300 }]

// Descending
// Tạo một hàm so sánh giảm dần với một valuating-function.

const descending = (fn) => (a, b) => {
  const valA = fn(b);
  const valB = fn(a);
  return valA < valB ? -1 : valA > valB ? 1 : 0;
}

const byPrice = descending(val => val.price);
[{ price: 300 }, { price: 100 }, { price: 200 }].sort(byPrice); 
// = [{ price: 300 }, { price: 200 }, { price: 100 }]

// Find Key
// Tìm khóa đầu tiên trong một chỉ mục thỏa mãn phạm vi đã cho.

const findKey = (predicate, index) => Object
  .keys(index)
  .find(key => predicate(index[key], key, index));

findKey(
  car => !car.available,
  {
    tesla: { available: true },
    ford: { available: false },
    gm: { available: true }
  },
); // = "ford"

// Bifurcate By
// Chia các value của một danh sách đã cho thành hai danh sách, một danh sách chứa các value mà hàm function-evaluates là đúng, danh sách kia chứa các phần tử còn lại. Hàm này mình cũng thường áp dụng trong dự án lắm. VD: để Bifurcate danh sách Nhân Viên có hoặc ko có thông tin nào đó. (ko có Email chẳng hạn)

const bifurcateBy = (predicate, list) =>
  list.reduce((acc, val, i) => (
    acc[predicate(val, i) ? 0 : 1].push(val), acc), 
    [[], []]
  );
  
bifurcateBy(val => val > 0, [-1, 2, -3, 4]); 
// = [[2, 4], [-1, -3]]

// Pipe
// Pipe này mình đã có nhắc ở đầu bài viết. Thực hiện các function composition từ trái sang phải. Tất cả các đối số bổ sung sẽ được chuyển đến hàm đầu tiên trong danh sách, do đó có thể có bất kỳ đối số nào. Kết quả sẽ được chuyển làm đối số tiếp theo, và kết quả thứ hai sẽ được chuyển sang thứ ba,… và cứ tiếp tục như vậy cho đến khi tất cả các hàm đã được xử lý.

const pipe = (functions, ...args) => (
  functions.reduce(
    (prev, next) => Array.isArray(prev) ? next(...prev) : next(prev),
    args
  )
);
pipe([Math.abs, Math.floor, val => -val], 4.20); // = -4
pipe([(a, b) => a - b, Math.abs], 5, 10); // = 5
// Trong thực tế có thể là

// Một ví dụ khác thực tế hơn

// const config = {};
// pip([Auth, Proxy, (c)= > c.role='Admin' ], config);
// Sau khi chạy qua pipe xong thì TÈN TEN
// config giờ nó ko phải là {} mà có thể là một Object chứa đầy đủ config cho dự án của bạn
// Và `Auth, Proxy, Role...` là các `Factory Function` mà các bạn đã định nghĩa trước đó rồi. (Còn về khái niệm Factory là gì nếu các bạn chưa biết thì có thể lục tìm lại bài viết của mình để tham khảo nhé)