import { MemberUploadForm } from '@/components/MemberUploadForm';
import { useSearchParams } from 'react-router-dom';

const MemberUpload = () => {
  const [params] = useSearchParams();
  const projectId = params.get('projectId') || 'demo-project-id';
  const groupName = params.get('groupName') || 'Demo Group';
  return <MemberUploadForm projectId={projectId} groupName={groupName} />;
};
export default MemberUpload; 