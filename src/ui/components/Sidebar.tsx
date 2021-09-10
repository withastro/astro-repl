import { h } from 'preact';

const Sidebar = () => {
    return (
    <aside id="sidebar" class="ap-sidebar">
        <div class="ap-logo-padding">
          <svg class="ap-logo" fill="none" viewBox="0 0 68 18" xmlns="http://www.w3.org/2000/svg">
            <path
              clip-rule="evenodd"
              d="m9.51396 1.71794 3.19104 10.41486c-1.2393-.6387-2.5684-1.0858-3.94181-1.3257l-2.14638-7.20626c-.01733-.05776-.05284-.10837-.10125-.14432-.04841-.03594-.10713-.05531-.16742-.0552-.0603.00011-.11895.01968-.16723.05579-.04828.03612-.08361.08686-.10074.14467l-2.12056 7.20172c-1.37966.2388-2.71486.6866-3.95961 1.3278l3.20732-10.4164c.18945-.61561.28417-.92351.46888-1.151492.16288-.201301.37454-.357608.61485-.454067.27221-.10934095.59416-.109341 1.23843-.109341h1.66118c.64503 0 .96755.00000002 1.23995.10953.24056.096671.45236.253316.61523.455017.18452.228362.27924.536643.46812 1.153393z"
              fill="#fff"
              fill-rule="evenodd"
            />
            <path
              clip-rule="evenodd"
              d="m9.42816 12.6449c-.54348.4617-1.62834.7766-2.87797.7766-1.53381 0-2.81932-.4743-3.16044-1.1124-.12187.3657-.1492.784-.1492 1.0515 0 0-.0803 1.3127.83865 2.2257 0-.4742.38668-.8584.86391-.8584.81796 0 .81702.7088.81626 1.284v.0513c0 .8732.53702 1.6213 1.30069 1.9368-.1175-.2402-.17841-.5041-.17805-.7715 0-.8326.49203-1.1427 1.06379-1.5028.45482-.2867.96052-.6052 1.30867-1.2442.18757-.3438.28562-.7293.28512-1.1209 0-.2494-.03911-.4899-.11143-.7157z"
              fill="#ff5d01"
              fill-rule="evenodd"
            />
            <path
              d="m23.0836 12.1174c2.4896 0 3.9953-.596 4.8748-1.8326 0 .5513.0298 1.0728.1044 1.5496h1.4757c-.134-.7749-.1638-1.2813-.1638-2.68188v-1.90719c0-2.05602-1.5952-3.14354-4.6364-3.14354-2.9366 0-4.8448 1.13213-5.0834 2.7711h1.5653c.2385-1.10252 1.4758-1.68377 3.5181-1.68377 2.0126 0 3.2053.70046 3.2053 1.89239v.14901l-4.6512.26823c-1.8933.10421-2.594.37244-3.1306.75988-.5069.37244-.7901.9535-.7901 1.62397 0 1.4154 1.4609 2.2348 3.7119 2.2348zm.477-1.0579c-1.7291 0-2.6832-.4022-2.6832-1.2067 0-.86429.5963-1.25153 2.6982-1.38574l4.368-.26804v.34264c0 1.56434-1.8338 2.51784-4.383 2.51784zm12.7221 1.0579c3.0858 0 4.3233-1.0131 4.3233-2.48822 0-1.22173-.7605-1.8474-2.6984-2.01141l-3.6225-.28284c-.9839-.0746-1.5353-.35764-1.5353-.9685 0-.77488.8497-1.17712 2.6832-1.17712 2.0872 0 3.1752.41724 3.8909 1.34094l1.2075-.58106c-.7455-1.16213-2.4002-1.84759-4.9642-1.84759-2.6386 0-4.2187.87909-4.2187 2.32424 0 1.29634.9391 1.92201 2.713 2.07102l3.5927.28322c1.1777.08922 1.5355.32765 1.5355.93851 0 .87911-.9093 1.29631-2.7132 1.29631-2.1914 0-3.5777-.596-4.2485-1.68375l-1.1777.64086c.9092 1.37059 2.5044 2.14539 5.2324 2.14539zm7.3734-6.61526v3.59078c0 1.47498.5069 2.94988 3.2647 2.94988.7006 0 1.5503-.134 1.9231-.298v-1.2067c-.5218.1192-1.1479.2088-1.7591.2088-1.2969 0-1.9976-.5069-1.9976-1.78819v-3.45657h3.7269v-1.11751h-3.7269v-2.51787l-1.4311.58106v1.937h-2.3405v1.11732zm8.712-1.11732h-1.3119v7.44958h1.4163v-2.78647c0-1.07252.2086-1.98161.8048-2.60728.5219-.58106 1.1927-.90889 2.3704-.90889.4025 0 .6559.0298.9989.08941v-1.37056c-.3132-.0746-.5815-.0896-.9841-.0896-1.5949 0-2.8622.9387-3.2944 2.38386v-2.16024zm10.2476 7.73258c3.1753 0 5.3518-1.6091 5.3518-4.00779 0-2.39885-2.1765-4.00801-5.3518-4.00801-3.1752 0-5.3518 1.60916-5.3518 4.00801 0 2.39869 2.1766 4.00779 5.3518 4.00779zm0-1.1769c-2.3404 0-3.8461-1.1027-3.8461-2.83089 0-1.72837 1.5057-2.83089 3.8461-2.83089 2.3256 0 3.8461 1.10252 3.8461 2.83089 0 1.72819-1.5205 2.83069-3.8461 2.83069z"
              fill="#fff"
            />
          </svg>
        </div>
        <ul role="tree" aria-label="Pages & Components" class="ap-files">
          <li class="ap-files-group">
            <button id="menu-pages" type="button" class="ap-files-group-title">Pages</button>
            <ul role="group" aria-labelledby="menu-pages" class="ap-files-list" aria-expanded="true">
              <li class="ap-files-filewrapper">
                <button type="button" role="tab" aria-selected="true" aria-controls="editor" class="ap-files-file">index.astro</button>
                <button type="button" aria-label="Delete index.astro" class="ap-files-delete">
                  <svg class="ap-icon ap-icon__delete"><use xlink:href="#icon-delete"></use></svg>
                </button>
              </li>
              <li class="ap-files-filewrapper">
                <button type="button" role="tab" class="ap-files-file">file-2-really-really-really-long-name.astro</button>
              </li>
              <li class="ap-files-action">
                <button type="button" class="ap-files-add" title="Add Page">
                  <svg class="ap-icon ap-icon__add"><use xlink:href="#icon-add"></use></svg>
                </button>
              </li>
            </ul>
          </li>
          <li class="ap-files-group">
            <button id="menu-components" type="button" class="ap-files-group-title">Components</button>
            <ul role="group" aria-labelledby="menu-components" class="ap-files-list" aria-expanded="true">
              <li class="ap-files-filewrapper"><button type="button" role="tab" class="ap-files-file">my-component.astro</button></li>
              <li class="ap-files-filewrapper"><button type="button" role="tab" class="ap-files-file">component-2.astro</button></li>
              <li class="ap-files-action">
                <button type="button" class="ap-files-add" title="Add Component">
                  <svg class="ap-icon ap-icon__add"><use xlink:href="#icon-add"></use></svg>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </aside>
    )
}

export default Sidebar;
