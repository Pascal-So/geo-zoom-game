use std::collections::BinaryHeap;

/// Entry in the binary heap.
///
/// For the eq and ord implementations, the item is completely ignored,
/// and the order on the weight is reversed.
#[derive(Clone)]
struct Entry<T> {
    item: T,
    weight: f64,
}

impl<T> PartialEq for Entry<T> {
    fn eq(&self, other: &Self) -> bool {
        self.weight == other.weight
    }
}
impl<T> Eq for Entry<T> {}

impl<T> Ord for Entry<T> {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.partial_cmp(other).unwrap()
    }
}
impl<T> PartialOrd for Entry<T> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        let ord = self.weight.partial_cmp(&other.weight)?;
        Some(ord.reverse())
    }
}

/// Weighted reservoir sampling
///
/// This uses the [A-Res](https://en.wikipedia.org/wiki/Reservoir_sampling#Algorithm_A-Res)
/// algorithm.
#[derive(Clone)]
pub struct Reservoir<T> {
    samples: usize,
    heap: BinaryHeap<Entry<T>>,
}

impl<T> Reservoir<T> {
    pub fn new(samples: usize) -> Self {
        Reservoir {
            samples,
            heap: BinaryHeap::with_capacity(samples),
        }
    }

    pub fn push(&mut self, item: T, weight: f64, rng: &mut impl rand::Rng) {
        let r = rng.gen::<f64>().powf(1.0 / weight);

        if self.heap.len() < self.samples {
            self.heap.push(Entry { item, weight: r });
        } else {
            let min = self.heap.peek().unwrap().weight;

            if r > min {
                self.heap.pop();
                self.heap.push(Entry { item, weight: r });
            }
        }
    }
}

impl<T> IntoIterator for Reservoir<T> {
    type Item = T;

    type IntoIter = impl Iterator<Item = Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.heap.into_iter().map(|entry| entry.item)
    }
}
