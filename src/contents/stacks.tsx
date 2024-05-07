import { BsRobot } from 'react-icons/bs';
import {
  SiAngular,
  SiAntdesign,
  SiCss3,
  SiFirebase,
  SiJasmine,
  SiJavascript,
  SiJest,
  SiMqtt,
  SiMui,
  SiNestjs,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiPrisma,
  SiPwa,
  SiReact,
  SiSocketdotio,
  SiStorybook,
  SiStyledcomponents,
  SiTailwindcss,
  SiTypescript,
  SiVite,
  SiWebpack,
} from 'react-icons/si';

export type stacksProps = {
  [key: string]: JSX.Element;
};

const iconSize = 24;

export const STACKS: stacksProps = {
  // PHP: <SiPhp size={iconSize} className='text-blue-500' />,
  JavaScript: <SiJavascript size={iconSize} className='text-yellow-400' />,
  TypeScript: <SiTypescript size={iconSize} className='text-blue-400' />,
  'Next.js': <SiNextdotjs size={iconSize} />,
  'React.js': <SiReact size={iconSize} className='text-sky-500' />,
  Angular: <SiAngular size={iconSize} className='text-red-500' />,
  TailwindCSS: <SiTailwindcss size={iconSize} className='text-cyan-300' />,
  // Bootstrap: (
  //   <BsFillBootstrapFill size={iconSize} className='text-purple-500' />
  // ),
  // GraphQL: <SiGraphql size={iconSize} className='text-pink-600' />,
  // Apollo: <SiApollographql size={iconSize} />,
  // WordPress: <SiWordpress size={iconSize} />,
  // Laravel: <SiLaravel size={iconSize} className='text-red-500' />,
  'Material UI': <SiMui size={iconSize} className='text-sky-400' />,
  Vite: <SiVite size={iconSize} className='text-purple-500' />,
  Prisma: <SiPrisma size={iconSize} className='text-emerald-500' />,
  Firebase: <SiFirebase size={iconSize} className='text-yellow-500' />,
  'Artificial Intelligence': (
    <BsRobot size={iconSize} className='text-rose-500' />
  ),
  // 'Vue.js': <SiVuedotjs size={iconSize} className='vue' />,
  // 'Nuxt.js': <SiNuxtdotjs size={iconSize} className='text-green-400' />,
  'Node.js': <SiNodedotjs size={iconSize} className='text-green-600' />,
  'Nest.js': <SiNestjs size={iconSize} className='nest' />,
  'Ant Design': <SiAntdesign size={iconSize} className='ant' />,
  // Swiper: <SiSwiper size={iconSize} className='swiper' />,
  // Gatsby: <SiGatsby size={iconSize} className='text-purple-600' />,
  // Redux: <SiRedux size={iconSize} className='text-purple-500' />,
  Webpack: <SiWebpack size={iconSize} className='text-blue-500' />,
  'Styled Components': (
    <SiStyledcomponents size={iconSize} className='text-pink-500' />
  ),
  PWA: <SiPwa size={iconSize} className='text-amber-600' />,
  Nginx: <SiNginx size={iconSize} className='text-green-500' />,
  Jest: <SiJest size={iconSize} className='text-red-600' />,
  Jasmine: <SiJasmine size={iconSize} className='text-red-500' />,
  Storybook: <SiStorybook size={iconSize} className='text-amber-500' />,
  CSS: <SiCss3 size={iconSize} className='text-blue-300' />,
  Socket: <SiSocketdotio size={iconSize} />,
  // Remix: <SiRemix size={iconSize} />,
  // Express: <SiExpress size={iconSize} />,
  // jQuery: <SiJquery size={iconSize} className='jquery' />,
  MQTT: <SiMqtt size={iconSize} className='text-purple-600' />,
};
