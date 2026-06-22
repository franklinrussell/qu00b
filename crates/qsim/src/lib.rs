// qu00b state-vector simulator core.
// State is 2^n complex amplitudes held as two parallel f64 arrays (re, im),
// kept in wasm linear memory. A single-qubit gate only mixes amplitude PAIRS
// that differ in bit q, so we walk those pairs and apply a 2x2 unitary — no
// 2^n x 2^n matrix is ever built. Controlled gates are the same loop guarded
// by the control bit. Cost is O(2^n) per gate.

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Sim {
    n: usize,
    size: usize,
    re: Vec<f64>,
    im: Vec<f64>,
}

#[inline]
fn apply_1q(
    re: &mut [f64],
    im: &mut [f64],
    q: usize,
    // row-major 2x2: [[a,b],[c,d]] as (real, imag) pairs
    ar: f64, ai: f64, br: f64, bi: f64,
    cr: f64, ci: f64, dr: f64, di: f64,
) {
    let bit = 1usize << q;
    let size = re.len();
    let mut i = 0usize;
    while i < size {
        if i & bit == 0 {
            let j = i | bit;
            let x_re = re[i]; let x_im = im[i];
            let y_re = re[j]; let y_im = im[j];
            // new[i] = a*x + b*y
            re[i] = ar * x_re - ai * x_im + br * y_re - bi * y_im;
            im[i] = ar * x_im + ai * x_re + br * y_im + bi * y_re;
            // new[j] = c*x + d*y
            re[j] = cr * x_re - ci * x_im + dr * y_re - di * y_im;
            im[j] = cr * x_im + ci * x_re + dr * y_im + di * y_re;
        }
        i += 1;
    }
}

#[inline]
fn apply_controlled_1q(
    re: &mut [f64],
    im: &mut [f64],
    control: usize,
    target: usize,
    ar: f64, ai: f64, br: f64, bi: f64,
    cr: f64, ci: f64, dr: f64, di: f64,
) {
    let cbit = 1usize << control;
    let tbit = 1usize << target;
    let size = re.len();
    let mut i = 0usize;
    while i < size {
        // act only on the target-bit=0 index of each pair, AND control=1
        if (i & tbit == 0) && (i & cbit != 0) {
            let j = i | tbit;
            let x_re = re[i]; let x_im = im[i];
            let y_re = re[j]; let y_im = im[j];
            re[i] = ar * x_re - ai * x_im + br * y_re - bi * y_im;
            im[i] = ar * x_im + ai * x_re + br * y_im + bi * y_re;
            re[j] = cr * x_re - ci * x_im + dr * y_re - di * y_im;
            im[j] = cr * x_im + ci * x_re + dr * y_im + di * y_re;
        }
        i += 1;
    }
}

#[wasm_bindgen]
impl Sim {
    #[wasm_bindgen(constructor)]
    pub fn new(n: usize) -> Sim {
        let size = 1usize << n;
        let mut re = vec![0.0; size];
        let im = vec![0.0; size];
        re[0] = 1.0; // |00..0>
        Sim { n, size, re, im }
    }

    pub fn reset(&mut self) {
        for v in self.re.iter_mut() { *v = 0.0; }
        for v in self.im.iter_mut() { *v = 0.0; }
        self.re[0] = 1.0;
    }

    pub fn qubits(&self) -> usize { self.n }

    // ---- Pauli / Clifford / phase gates ----
    pub fn x(&mut self, q: usize) {
        apply_1q(&mut self.re, &mut self.im, q, 0.0,0.0, 1.0,0.0, 1.0,0.0, 0.0,0.0);
    }
    pub fn y(&mut self, q: usize) {
        // [[0,-i],[i,0]]
        apply_1q(&mut self.re, &mut self.im, q, 0.0,0.0, 0.0,-1.0, 0.0,1.0, 0.0,0.0);
    }
    pub fn z(&mut self, q: usize) {
        apply_1q(&mut self.re, &mut self.im, q, 1.0,0.0, 0.0,0.0, 0.0,0.0, -1.0,0.0);
    }
    pub fn h(&mut self, q: usize) {
        let s = std::f64::consts::FRAC_1_SQRT_2;
        apply_1q(&mut self.re, &mut self.im, q, s,0.0, s,0.0, s,0.0, -s,0.0);
    }
    pub fn s(&mut self, q: usize) {
        // [[1,0],[0,i]]
        apply_1q(&mut self.re, &mut self.im, q, 1.0,0.0, 0.0,0.0, 0.0,0.0, 0.0,1.0);
    }
    pub fn t(&mut self, q: usize) {
        // [[1,0],[0, e^{i pi/4}]]
        let c = std::f64::consts::FRAC_1_SQRT_2;
        apply_1q(&mut self.re, &mut self.im, q, 1.0,0.0, 0.0,0.0, 0.0,0.0, c,c);
    }

    // ---- Rotations (theta in radians) ----
    pub fn rx(&mut self, q: usize, theta: f64) {
        let (c, s) = ((theta/2.0).cos(), (theta/2.0).sin());
        // [[c, -i s],[-i s, c]]
        apply_1q(&mut self.re, &mut self.im, q, c,0.0, 0.0,-s, 0.0,-s, c,0.0);
    }
    pub fn ry(&mut self, q: usize, theta: f64) {
        let (c, s) = ((theta/2.0).cos(), (theta/2.0).sin());
        // [[c, -s],[s, c]]
        apply_1q(&mut self.re, &mut self.im, q, c,0.0, -s,0.0, s,0.0, c,0.0);
    }
    pub fn rz(&mut self, q: usize, theta: f64) {
        let (c, s) = ((theta/2.0).cos(), (theta/2.0).sin());
        // [[e^{-i t/2},0],[0,e^{i t/2}]]
        apply_1q(&mut self.re, &mut self.im, q, c,-s, 0.0,0.0, 0.0,0.0, c,s);
    }

    // ---- Two-qubit ----
    pub fn cnot(&mut self, control: usize, target: usize) {
        apply_controlled_1q(&mut self.re, &mut self.im, control, target,
            0.0,0.0, 1.0,0.0, 1.0,0.0, 0.0,0.0);
    }
    pub fn cz(&mut self, control: usize, target: usize) {
        // controlled-Z: only flips sign of |..1..1..>; apply Z on target when control=1
        apply_controlled_1q(&mut self.re, &mut self.im, control, target,
            1.0,0.0, 0.0,0.0, 0.0,0.0, -1.0,0.0);
    }

    // ---- Readout ----
    // Probabilities over all 2^n basis states, returned as a flat Float64Array (length 2^n).
    pub fn probabilities(&self) -> Vec<f64> {
        let mut p = vec![0.0; self.size];
        for k in 0..self.size {
            p[k] = self.re[k]*self.re[k] + self.im[k]*self.im[k];
        }
        p
    }

    // Marginal P(qubit q == 1).
    pub fn prob_one(&self, q: usize) -> f64 {
        let bit = 1usize << q;
        let mut acc = 0.0;
        for k in 0..self.size {
            if k & bit != 0 { acc += self.re[k]*self.re[k] + self.im[k]*self.im[k]; }
        }
        acc
    }

    // Sample `shots` measurements of the full register using a caller-provided
    // uniform stream (so randomness lives in JS — pass Math.random() values).
    // Returns counts over basis states as a Float64Array of length 2^n.
    pub fn sample(&self, rand_stream: &[f64]) -> Vec<f64> {
        let mut counts = vec![0.0; self.size];
        let p = self.probabilities();
        for &r in rand_stream {
            let mut acc = 0.0;
            let mut chosen = self.size - 1;
            for k in 0..self.size {
                acc += p[k];
                if r <= acc { chosen = k; break; }
            }
            counts[chosen] += 1.0;
        }
        counts
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn close(a: f64, b: f64) -> bool { (a-b).abs() < 1e-9 }

    #[test]
    fn h_makes_equal_superposition() {
        let mut s = Sim::new(1);
        s.h(0);
        let p = s.probabilities();
        assert!(close(p[0], 0.5) && close(p[1], 0.5));
    }

    #[test]
    fn bell_state_is_correlated() {
        // H on q0 then CNOT(0->1) => (|00> + |11>)/sqrt2
        let mut s = Sim::new(2);
        s.h(0);
        s.cnot(0, 1);
        let p = s.probabilities(); // index = b1<<1 | b0
        assert!(close(p[0], 0.5)); // |00>
        assert!(close(p[3], 0.5)); // |11>
        assert!(close(p[1], 0.0) && close(p[2], 0.0));
    }

    #[test]
    fn x_flips() {
        let mut s = Sim::new(1);
        s.x(0);
        assert!(close(s.prob_one(0), 1.0));
    }

    #[test]
    fn rx_pi_equals_x_up_to_phase() {
        let mut s = Sim::new(1);
        s.rx(0, std::f64::consts::PI);
        assert!(close(s.prob_one(0), 1.0));
    }
}
