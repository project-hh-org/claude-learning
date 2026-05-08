import { getAllConfigs } from '@/lib/configs'
import ConfigsList from '@/components/list/ConfigsList'

export const metadata = {
  title: 'Claude Configs',
  description: 'Claude Code rule / hook / command / skill 모음',
}

export default function ConfigsIndexPage() {
  const configs = getAllConfigs()
  return <ConfigsList configs={configs} />
}
