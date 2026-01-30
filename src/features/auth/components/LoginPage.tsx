import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, Trans } from 'react-i18next';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { loginRequestSchema } from '../types/auth';
import type { z } from 'zod';
import { useLogin } from '../hooks/useLogin';
import { useBranches } from '../hooks/useBranches';
import { useAuthStore } from '@/stores/auth-store';
import { isTokenValid } from '@/utils/jwt';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

import loginImage from '../../../../public/veriicrmlogo.png';

import { 
  Location01Icon, 
  Mail02Icon, 
  LockKeyIcon, 
  ViewIcon, 
  ViewOffIcon, 
  Call02Icon,        
} from 'hugeicons-react';

export function LoginPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: branches } = useBranches();
  const { mutate: login, isPending } = useLogin(branches);
  const { logout } = useAuthStore();
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  
  const mountRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.input<typeof loginRequestSchema>>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: '',
      password: '',
      branchId: '',
      rememberMe: true,
    },
  });

  useEffect(() => {
    if (!mountRef.current) return;

    while(mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a0b2e, 20, 100);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const particleCount = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions = new Float32Array(particleCount * 3);
    const particlesVelocities: {x: number, y: number, z: number}[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlesPositions[i * 3] = (Math.random() - 0.5) * 60;
      particlesPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      particlesPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      particlesVelocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.02
      });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffedd5,
      size: 0.4,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.12
    });
    const maxLines = particleCount * particleCount;
    const linePositions = new Float32Array(maxLines * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    const pulsesCount = 15;
    const pulsesGeo = new THREE.BufferGeometry();
    const pulsesPos = new Float32Array(pulsesCount * 3);
    const pulsesGeoAttr = new THREE.BufferAttribute(pulsesPos, 3);
    pulsesGeo.setAttribute('position', pulsesGeoAttr);
    const pulsesMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.9,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    const pulsesMesh = new THREE.Points(pulsesGeo, pulsesMat);
    scene.add(pulsesMesh);
    
    const activePulses = Array(pulsesCount).fill(null).map(() => ({
      active: false, startIdx: 0, endIdx: 0, progress: 0, speed: 0
    }));

    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const pos = particlesMesh.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particlesVelocities[i].x;
        pos[i * 3 + 1] += particlesVelocities[i].y;
        pos[i * 3 + 2] += particlesVelocities[i].z;

        if (pos[i * 3] > 40 || pos[i * 3] < -40) particlesVelocities[i].x *= -1;
        if (pos[i * 3 + 1] > 30 || pos[i * 3 + 1] < -30) particlesVelocities[i].y *= -1;
        if (pos[i * 3 + 2] > 15 || pos[i * 3 + 2] < -15) particlesVelocities[i].z *= -1;
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true;

      let lineIdx = 0;
      const connectionDistance = 8;
      const connections: [number, number][] = [];

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = pos[i * 3] - pos[j * 3];
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDistance) {
            linePositions[lineIdx++] = pos[i * 3];
            linePositions[lineIdx++] = pos[i * 3 + 1];
            linePositions[lineIdx++] = pos[i * 3 + 2];
            linePositions[lineIdx++] = pos[j * 3];
            linePositions[lineIdx++] = pos[j * 3 + 1];
            linePositions[lineIdx++] = pos[j * 3 + 2];
            connections.push([i, j]);
          }
        }
      }
      linesMesh.geometry.setDrawRange(0, lineIdx / 3);
      linesMesh.geometry.attributes.position.needsUpdate = true;

      const pPos = pulsesMesh.geometry.attributes.position.array as Float32Array;
      activePulses.forEach((pulse, idx) => {
        if (!pulse.active) {
          if (Math.random() > 0.95 && connections.length > 0) {
            const conn = connections[Math.floor(Math.random() * connections.length)];
            pulse.active = true;
            pulse.startIdx = conn[0];
            pulse.endIdx = conn[1];
            pulse.progress = 0;
            pulse.speed = 0.02 + Math.random() * 0.03;
          } else {
            pPos[idx * 3] = 9999;
          }
        } else {
          pulse.progress += pulse.speed;
          if (pulse.progress >= 1) {
            pulse.active = false;
          } else {
            const x1 = pos[pulse.startIdx * 3];
            const y1 = pos[pulse.startIdx * 3 + 1];
            const z1 = pos[pulse.startIdx * 3 + 2];
            const x2 = pos[pulse.endIdx * 3];
            const y2 = pos[pulse.endIdx * 3 + 1];
            const z2 = pos[pulse.endIdx * 3 + 2];

            pPos[idx * 3] = x1 + (x2 - x1) * pulse.progress;
            pPos[idx * 3 + 1] = y1 + (y2 - y1) * pulse.progress;
            pPos[idx * 3 + 2] = z1 + (z2 - z1) * pulse.progress;
          }
        }
      });
      pulsesMesh.geometry.attributes.position.needsUpdate = true;

      scene.rotation.y += 0.0008;
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      pulsesGeo.dispose();
      pulsesMat.dispose();
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('sessionExpired') === 'true') {
      logout();
      toast.warning(t('auth.login.sessionExpired'));
      setSearchParams({}, { replace: true });
      return;
    }

    const storedToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (storedToken && isTokenValid(storedToken)) {
      navigate('/', { replace: true });
    }
  }, [searchParams, setSearchParams, t, navigate, logout]);

  const onSubmit = (data: z.output<typeof loginRequestSchema>): void => {
    login({ ...data });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0f0518] text-white font-['Outfit']">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        input {
          color-scheme: dark;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #140a1e inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
            caret-color: white;
            color-scheme: dark;
        }
      `}</style>

      <div ref={mountRef} className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,#1a0b2e_0%,#000000_100%)]" />

      <div className="relative z-10 w-full h-full flex flex-col justify-between items-center px-4 py-8 overflow-y-auto">

        <div className="absolute top-6 right-6 z-20">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md p-10 rounded-3xl bg-[#140a1e]/70 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4),_inset_0_0_20px_rgba(255,255,255,0.07)] animate-[fadeIn_0.8s_ease-out] my-auto">
          <div className="text-center mb-8">
            <img
              src={loginImage}
              alt="Logo"
              className="inline-flex items-center justify-center w-80 h-50  object-contain p-2"
            />
            <p className="text-slate-400 text-xs uppercase tracking-[0.15em] mt-2 font-medium">
              {t('auth.login.title')}
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              
              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Location01Icon 
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-400" 
                          size={18} 
                        />
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full h-auto bg-black/10 border border-white/10 rounded-xl px-4 py-6 pl-12 text-sm text-white focus:ring-0 focus:ring-offset-0 focus:border-pink-500 focus:bg-black/30 transition-colors">
                            <SelectValue placeholder={t('auth.login.branchPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 backdrop-blur-xl border border-white/10 text-white">
                            {branches?.map((branch) => (
                              <SelectItem
                                key={branch.id}
                                value={branch.id}
                                className="focus:bg-pink-500/20 focus:text-white cursor-pointer"
                              >
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Mail02Icon 
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-400" 
                          size={18} 
                        />
                        <Input
                          {...field}
                          type="email"
                          placeholder={t('auth.login.emailPlaceholder', 'Kurumsal E-posta')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-6 pl-12 pr-10 text-sm text-white placeholder-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-pink-500 focus:bg-black/50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <LockKeyIcon 
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-400" 
                          size={18} 
                        />
                        <Input
                          {...field}
                          type={isPasswordVisible ? 'text' : 'password'}
                          placeholder={t('auth.login.passwordPlaceholder', 'Şifre')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-6 pl-12 pr-10 text-sm text-white placeholder-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-pink-500 focus:bg-black/50"
                          onKeyDown={(e) => setCapsLockActive(e.getModifierState('CapsLock'))}
                          onKeyUp={(e) => setCapsLockActive(e.getModifierState('CapsLock'))}
                        />
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible(v => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {isPasswordVisible ? (
                            <ViewOffIcon size={20}  />
                          ) : (
                            <ViewIcon size={20} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    
                    {capsLockActive && (
                      <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                        <span className="text-orange-500 text-sm">⚠️</span> 
                        CAPS LOCK AÇIK
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
            
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-pink-400 transition">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="accent-pink-500 rounded bg-slate-800 border-none w-3.5 h-3.5"
                          />
                          {t('auth.login.rememberMe')}
                        </label>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Link to="/auth/forgot-password" className="hover:text-orange-400 transition">{t('auth.login.forgotPassword')}</Link>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 hover:from-pink-500 hover:via-orange-400 hover:to-yellow-400 text-white font-bold text-sm mt-6 shadow-lg shadow-orange-900/20 tracking-wide uppercase transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isPending ? t('auth.login.processing') : t('auth.login.submitButton')}
              </button>

            </form>
          </Form>
        </div>

        <div className="w-full max-w-4xl z-20 mt-8 flex flex-col items-center gap-6 pb-6">
          <p className="text-slate-400 text-sm font-light tracking-[0.2em] uppercase opacity-80 text-center">
            <Trans
              i18nKey="auth.login.slogan"
              components={{ 1: <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400 font-bold border-b border-pink-500/20 pb-0.5" /> }}
            />
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 px-4">
            
            <a href="tel:+905070123018" className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/5 text-slate-400 hover:text-lime-400 hover:bg-white/10 hover:border-lime-500/30 hover:shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:scale-110 transition-all duration-300 group">
              <Call02Icon size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
