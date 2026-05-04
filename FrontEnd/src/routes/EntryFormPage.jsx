import { useContext, useEffect, useState } from 'react';
import { Form } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Api from '../helpers/core/Api';
import ContentPanel from '../components/core/layout/ContentPanel';
import EntryForm from '../components/diary/EntryForm';
import MessageContext from '../helpers/core/MessageContext';
import { buildEntryFormValues, getDefaultEntryFormValues, normalizeEntryPayload } from '../helpers/diary/entries';

const EntriesFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { entryId } = useParams();
  const { loadingMsg, savedMsg, errorMsg } = useContext(MessageContext);

  const isEditing = Boolean(entryId);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      form.setFieldsValue(getDefaultEntryFormValues());
      return;
    }

    const loadEntry = async () => {
      setLoading(true);

      try {
        // Load the entry before editing so the form stays aligned with the API source of truth.
        const response = await Api.get(`/entries/${entryId}`);
        form.setFieldsValue(buildEntryFormValues(response.data));
      } catch (error) {
        errorMsg(loadingMsg(), error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [entryId, errorMsg, form, isEditing, loadingMsg, navigate]);

  const handleSubmit = async values => {
    const messageKey = loadingMsg();
    setSaving(true);

    try {
      const payload = normalizeEntryPayload(values);

      if (isEditing) {
        await Api.patch(`/entries/${entryId}`, payload);
      } else {
        await Api.post('/entries', payload);
      }

      savedMsg(messageKey);
      navigate('/');
    } catch (error) {
      errorMsg(messageKey, error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentPanel
      title={isEditing ? t('common.editEntry') : t('common.addEntry')}
      subtitle={isEditing ? t('common.editEntrySubtitle') : t('common.addEntrySubtitle')}
      back={() => navigate('/')}
      loading={loading}
    >
      <EntryForm
        form={form}
        initialValues={getDefaultEntryFormValues()}
        onFinish={handleSubmit}
        onCancel={() => navigate('/')}
        saving={saving}
      />
    </ContentPanel>
  );
};

export default EntriesFormPage;
