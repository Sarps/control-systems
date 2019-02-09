wn = 5
zt = 0.1
G = tf(wn^2, [1, 2*zt*wn, wn^2])
subplot(1,3,1)
step(G)
p = 10
G1 = tf(p, [1,p])
G2 = G1 * G
subplot(1,3,2)
step(G2)
zt = 3
G1z = tf([1,zt], zt)
G2z = G1z * G
subplot(1,3,3)
step(G2z)