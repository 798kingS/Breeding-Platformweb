import React from 'react';
import {
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormDatePicker,
  ProFormDigit,
  ModalForm,
} from '@ant-design/pro-components';

export type FormValueType = {
  key: number;
  photo: string;
  varietyName: string;
  type: string;
  introductionYear: string;
  source: string;
  breedingType: string;
  seedNumber: string;
  plantingYear: string;
  resistance: string;
  fruitCharacteristics: string;
  floweringPeriod: string;
  fruitCount: number;
  yield: number;
  fruitShape: string;
  skinColor: string;
  fleshColor: string;
  singleFruitWeight: number;
  fleshThickness: number;
  sugarContent: number;
  texture: string;
  overallTaste: string;
  combiningAbility: string;
  hybridization: string;
  parentMale?: string;
  parentFemale?: string;
  name: string;
  desc: string;
};

export type UpdateFormProps = {
  onSubmit: (values: FormValueType) => Promise<void>;
  onCancel: () => void;
  updateModalOpen: boolean;
  values: Partial<FormValueType>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  return (
    <ModalForm
      title="编辑品种信息"
      open={props.updateModalOpen}
      onFinish={props.onSubmit}
      modalProps={{
        onCancel: () => {
          props.onCancel();
        },
      }}
      initialValues={props.values}
    >
      <ProFormText
        name="varietyName"
        label="品种名称"
        rules={[{ required: true, message: '请输入品种名称' }]}
      />
      <ProFormSelect
        name="type"
        label="类型"
        rules={[{ required: true, message: '请选择类型' }]}
        options={[
          { label: '西瓜', value: '西瓜' },
          { label: '甜瓜', value: '甜瓜' },
          { label: '南瓜', value: '南瓜' },
          { label: '黄瓜', value: '黄瓜' },
        ]}
      />
      <ProFormText
        name="photo"
        label="照片URL"
        rules={[{ required: true, message: '请输入照片URL' }]}
      />
      <ProFormDatePicker
        name="introductionYear"
        label="引种年份"
        rules={[{ required: true, message: '请选择引种年份' }]}
        fieldProps={{
          picker: 'year',
        }}
      />
      <ProFormText
        name="source"
        label="来源"
        rules={[{ required: true, message: '请输入来源' }]}
      />
      <ProFormSelect
        name="breedingType"
        label="常规种/纯化"
        rules={[{ required: true, message: '请选择常规种/纯化' }]}
        options={[
          { label: '常规种', value: 'regular' },
          { label: '纯化', value: 'pure' },
        ]}
      />
      <ProFormText
        name="seedNumber"
        label="留种编号"
        rules={[{ required: true, message: '请输入留种编号' }]}
      />
      <ProFormDatePicker
        name="plantingYear"
        label="种植年份"
        rules={[{ required: true, message: '请选择种植年份' }]}
        fieldProps={{
          picker: 'year',
        }}
      />
      <ProFormText
        name="resistance"
        label="抗性"
      />
      <ProFormTextArea
        name="fruitCharacteristics"
        label="结果特征"
      />
      <ProFormText
        name="floweringPeriod"
        label="开花期/果实发育期"
      />
      <ProFormDigit
        name="fruitCount"
        label="留果个数"
        min={0}
      />
      <ProFormDigit
        name="yield"
        label="产量"
        min={0}
      />
      <ProFormText
        name="fruitShape"
        label="果型"
      />
      <ProFormText
        name="skinColor"
        label="皮色"
      />
      <ProFormText
        name="fleshColor"
        label="肉色"
      />
      <ProFormDigit
        name="singleFruitWeight"
        label="单果重(g)"
        min={0}
      />
      <ProFormDigit
        name="fleshThickness"
        label="肉厚(mm)"
        min={0}
      />
      <ProFormDigit
        name="sugarContent"
        label="糖度(°Brix)"
        min={0}
      />
      <ProFormText
        name="texture"
        label="质地"
      />
      <ProFormText
        name="overallTaste"
        label="总体口感"
      />
      <ProFormText
        name="combiningAbility"
        label="配合力"
      />
      <ProFormText
        name="parentMale"
        label="父本"
      />
      <ProFormText
        name="parentFemale"
        label="母本"
      />
    </ModalForm>
  );
};

export default UpdateForm;
